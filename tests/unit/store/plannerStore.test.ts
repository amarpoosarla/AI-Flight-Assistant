import { act } from 'react';
import { usePlannerStore } from '@/store/plannerStore';

// Reset store between tests
beforeEach(() => {
  act(() => {
    usePlannerStore.getState().clearSession();
  });
});

describe('plannerStore', () => {
  it('starts with empty messages', () => {
    expect(usePlannerStore.getState().messages).toHaveLength(0);
  });

  it('addMessage appends a message', () => {
    act(() => {
      usePlannerStore.getState().addMessage({
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString(),
      });
    });
    expect(usePlannerStore.getState().messages).toHaveLength(1);
    expect(usePlannerStore.getState().messages[0].content).toBe('Hello');
  });

  it('appendStreamChunk accumulates text', () => {
    act(() => {
      usePlannerStore.getState().appendStreamChunk('Hello ');
      usePlannerStore.getState().appendStreamChunk('world');
    });
    expect(usePlannerStore.getState().streamingText).toBe('Hello world');
  });

  it('commitStreamedMessage moves streamingText into messages', () => {
    act(() => {
      usePlannerStore.getState().appendStreamChunk('Final answer');
      usePlannerStore.getState().commitStreamedMessage();
    });
    const state = usePlannerStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('assistant');
    expect(state.messages[0].content).toBe('Final answer');
    expect(state.streamingText).toBe('');
    expect(state.streaming).toBe(false);
  });

  it('clearSession resets all state', () => {
    act(() => {
      usePlannerStore.getState().addMessage({
        id: '1',
        role: 'user',
        content: 'Test',
        timestamp: new Date().toISOString(),
      });
      usePlannerStore.getState().setSessionId('abc-123');
      usePlannerStore.getState().clearSession();
    });
    const state = usePlannerStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.sessionId).toBeNull();
  });

  it('setError clears streaming state', () => {
    act(() => {
      usePlannerStore.getState().setStreaming(true);
      usePlannerStore.getState().appendStreamChunk('partial...');
      usePlannerStore.getState().setError('Something went wrong');
    });
    const state = usePlannerStore.getState();
    expect(state.error).toBe('Something went wrong');
    expect(state.streaming).toBe(false);
    expect(state.streamingText).toBe('');
  });
});
