import { render, screen } from '@testing-library/react';
import ChatMessage, { StreamingMessage } from '@/components/planner/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/planner';

const makeMsg = (role: 'user' | 'assistant', content: string): ChatMessageType => ({
  id: '1',
  role,
  content,
  timestamp: new Date().toISOString(),
});

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={makeMsg('user', 'Find me flights to NYC')} />);
    expect(screen.getByText('Find me flights to NYC')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<ChatMessage message={makeMsg('assistant', 'Here are the best flights.')} />);
    expect(screen.getByText('Here are the best flights.')).toBeInTheDocument();
  });

  it('renders bold markdown in assistant messages', () => {
    render(<ChatMessage message={makeMsg('assistant', '**Total: $500**')} />);
    expect(screen.getByText('Total: $500')).toBeInTheDocument();
  });

  it('renders bullet list items', () => {
    render(<ChatMessage message={makeMsg('assistant', '- Flight AA 100\n- Departs 9am')} />);
    expect(screen.getByText('Flight AA 100')).toBeInTheDocument();
    expect(screen.getByText('Departs 9am')).toBeInTheDocument();
  });

  it('renders H3 headers', () => {
    render(<ChatMessage message={makeMsg('assistant', '### Best Option')} />);
    expect(screen.getByText('Best Option')).toBeInTheDocument();
  });

  it('shows AI avatar for assistant messages', () => {
    render(<ChatMessage message={makeMsg('assistant', 'Hello')} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('does not show AI avatar for user messages', () => {
    render(<ChatMessage message={makeMsg('user', 'Hello')} />);
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
  });
});

describe('StreamingMessage', () => {
  it('shows default thinking label when no text or status', () => {
    render(<StreamingMessage text="" statusText={null} />);
    expect(screen.getByText('Analyzing your request…')).toBeInTheDocument();
  });

  it('shows status text when provided', () => {
    render(<StreamingMessage text="" statusText="🧠 Analyzing your request..." />);
    expect(screen.getByText('🧠 Analyzing your request...')).toBeInTheDocument();
  });

  it('shows multiple status lines on separate lines', () => {
    render(<StreamingMessage text="" statusText={'Line one\nLine two'} />);
    expect(screen.getByText('Line one')).toBeInTheDocument();
    expect(screen.getByText('Line two')).toBeInTheDocument();
  });

  it('renders streaming text when present', () => {
    render(<StreamingMessage text="Here are your flights" statusText={null} />);
    expect(screen.getByText('Here are your flights')).toBeInTheDocument();
  });

  it('shows AI avatar', () => {
    render(<StreamingMessage text="" statusText={null} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});
