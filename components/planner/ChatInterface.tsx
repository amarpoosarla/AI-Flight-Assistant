'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, Plane, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlanner } from '@/hooks/usePlanner';
import ChatMessage, { StreamingMessage } from './ChatMessage';

const STARTER_PROMPTS = [
  "Me and my girlfriend want to fly to Vegas for 3 days between Mar 16-21. I'm from DFW, she's from Chicago. Cheapest combined, arrive within 3 hours of each other.",
  'Find me the cheapest nonstop flights from JFK to LAX next Friday.',
  'My team of 3 is flying to Miami from NYC, Boston, and DC — best dates in June under $400 each?',
];

export default function ChatInterface() {
  const { messages, streaming, streamingText, statusText, error, sendMessage, clearSession } =
    usePlanner();

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isIdle = !streaming;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, statusText]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <Plane className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">AI Travel Planner</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-8">
              Describe your trip in plain English — I&apos;ll find the best flights for everyone,
              including multi-city group travel.
            </p>

            {/* Starter prompts */}
            <div className="w-full max-w-lg space-y-2">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={streaming}
                  className={cn(
                    'w-full text-left text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3',
                    'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator */}
        {streaming && <StreamingMessage text={streamingText} statusText={statusText} />}

        {/* Error */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-700 max-w-[85%]">
              {error}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        {!isEmpty && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={clearSession}
              disabled={streaming}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3 h-3" />
              New conversation
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isIdle}
            rows={1}
            placeholder={
              streaming ? 'AI is thinking...' : 'Ask about flights or describe your group trip...'
            }
            className={cn(
              'flex-1 resize-none border rounded-xl px-4 py-3 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'max-h-40 scrollbar-hide',
              streaming
                ? 'border-brand-200 bg-brand-50/40 cursor-not-allowed text-slate-400'
                : 'border-slate-300 disabled:bg-slate-50 disabled:cursor-not-allowed'
            )}
          />
          {streaming ? (
            <button
              type="button"
              onClick={clearSession}
              className={cn(
                'w-10 h-10 rounded-xl bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 flex-shrink-0',
                'flex items-center justify-center transition-colors'
              )}
              aria-label="Stop generation"
              title="Stop"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                'w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex-shrink-0',
                'flex items-center justify-center transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {streaming
            ? 'AI is working on your request...'
            : 'Press Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  );
}
