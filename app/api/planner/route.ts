import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { chatStream } from '@/lib/planner-agent';
import type { LLMMessage } from '@/lib/planner-agent';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  sessionId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, sessionId } = parsed.data;

  // Persist / update session (fire-and-forget)
  if (sessionId) {
    supabase
      .from('planner_sessions')
      .update({ messages: JSON.stringify(messages) })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error) console.warn('[planner] session update failed:', error.message);
      });
  } else {
    // Auto-title from first user message (truncated)
    const title =
      messages.find((m) => m.role === 'user')?.content?.slice(0, 80) ?? 'New conversation';
    supabase
      .from('planner_sessions')
      .insert({ user_id: user.id, messages: JSON.stringify(messages), title })
      .then(({ error }) => {
        if (error) console.warn('[planner] session insert failed:', error.message);
      });
  }

  // Stream response via two-agent pipeline
  const llmMessages: LLMMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const stream = await chatStream(llmMessages);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // disable Nginx buffering on Vercel
      },
    });
  } catch (err) {
    console.error('[planner] stream init error:', err);
    return NextResponse.json(
      { error: 'AI planner is temporarily unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
