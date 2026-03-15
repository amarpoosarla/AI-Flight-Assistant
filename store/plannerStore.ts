import { create } from 'zustand';
import type { ChatMessage } from '@/types/planner';

interface PlannerStore {
  messages: ChatMessage[];
  sessionId: string | null;
  streaming: boolean;
  streamingText: string; // accumulates while streaming
  statusText: string | null; // e.g. "Searching DFW → LAS..."
  error: string | null;

  addMessage: (msg: ChatMessage) => void;
  setSessionId: (id: string) => void;
  setStreaming: (v: boolean) => void;
  appendStreamChunk: (text: string) => void;
  setStatusText: (text: string | null) => void;
  commitStreamedMessage: () => void; // flush streamingText → messages
  setError: (msg: string | null) => void;
  clearSession: () => void;
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  messages: [],
  sessionId: null,
  streaming: false,
  streamingText: '',
  statusText: null,
  error: null,

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  setSessionId: (id) => set({ sessionId: id }),

  setStreaming: (v) => set({ streaming: v }),

  appendStreamChunk: (text) => set((s) => ({ streamingText: s.streamingText + text })),

  setStatusText: (text) => set({ statusText: text }),

  commitStreamedMessage: () => {
    const { streamingText } = get();

    if (!streamingText.trim()) {
      // Nothing to commit — just reset streaming state so UI unblocks
      set({ streaming: false, statusText: null });
      return;
    }

    const msg: ChatMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      content: streamingText,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, msg],
      streamingText: '',
      streaming: false,
      statusText: null,
    }));
  },

  setError: (msg) => set({ error: msg, streaming: false, streamingText: '', statusText: null }),

  clearSession: () =>
    set({
      messages: [],
      sessionId: null,
      streaming: false,
      streamingText: '',
      statusText: null,
      error: null,
    }),
}));
