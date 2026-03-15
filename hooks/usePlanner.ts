'use client';

import { usePlannerStore } from '@/store/plannerStore';
import { generateId } from '@/lib/utils';
import type { ChatMessage } from '@/types/planner';

export function usePlanner() {
  const store = usePlannerStore();

  async function sendMessage(content: string) {
    if (store.streaming) return;

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    store.addMessage(userMsg);
    store.setStreaming(true);
    store.setError(null);

    // Build messages array to send (all history + new message)
    const allMessages = [...store.messages, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          // omit sessionId entirely when null — Zod .optional() rejects null
          ...(store.sessionId ? { sessionId: store.sessionId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Request failed');
      }

      // Read the SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw) as { type: string; text?: string };

            if (event.type === 'status' && event.text) {
              store.setStatusText(event.text);
            } else if (event.type === 'text' && event.text) {
              store.setStatusText(null);
              store.appendStreamChunk(event.text);
            } else if (event.type === 'error' && event.text) {
              store.setError(event.text);
              return;
            } else if (event.type === 'done') {
              store.commitStreamedMessage();
              return;
            }
          } catch {
            // Malformed SSE line — skip
          }
        }
      }

      // Stream ended without a 'done' event — commit whatever we have
      store.commitStreamedMessage();
    } catch (err) {
      store.setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      // Safety net: ensure we never leave the UI stuck in loading
      if (store.streaming) {
        store.commitStreamedMessage();
      }
    }
  }

  return {
    messages: store.messages,
    streaming: store.streaming,
    streamingText: store.streamingText,
    statusText: store.statusText,
    error: store.error,
    sendMessage,
    clearSession: store.clearSession,
  };
}
