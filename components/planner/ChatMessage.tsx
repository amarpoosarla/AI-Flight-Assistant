'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/planner';

interface Props {
  message: ChatMessageType;
}

// Minimal markdown renderer — handles bold, bullets, headers, horizontal rules.
// Avoids a full markdown library dependency to keep bundle size small.
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key++} className="border-slate-200 my-3" />);
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={key++} className="font-semibold text-slate-900 text-sm mt-4 mb-1">
          {inlineFormat(line.slice(4))}
        </h3>
      );
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={key++} className="font-bold text-slate-900 text-base mt-4 mb-2">
          {inlineFormat(line.slice(3))}
        </h2>
      );
      continue;
    }

    // Bullet list item
    if (/^[-*] /.test(line)) {
      nodes.push(
        <li
          key={key++}
          className="ml-4 text-sm leading-relaxed list-none before:content-['•'] before:mr-2 before:text-slate-400"
        >
          {inlineFormat(line.slice(2))}
        </li>
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1" />);
      continue;
    }

    // Normal paragraph
    nodes.push(
      <p key={key++} className="text-sm leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
  }

  return nodes;
}

// Handle **bold** and *italic* inline
function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
        )}
      </div>
    </div>
  );
}

// Streaming bubble shown while the assistant is typing
export function StreamingMessage({
  text,
  statusText,
}: {
  text: string;
  statusText: string | null;
}) {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">AI</span>
      </div>

      <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
        {statusText && !text && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
            </span>
            <span className="text-xs text-slate-500 whitespace-pre-line">{statusText}</span>
          </div>
        )}

        {text && (
          <div className="space-y-0.5">
            {renderMarkdown(text)}
            <span className="inline-block w-0.5 h-3.5 bg-brand-500 animate-pulse ml-0.5 align-text-bottom" />
          </div>
        )}

        {!text && !statusText && (
          <div className="flex gap-1 items-center h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
