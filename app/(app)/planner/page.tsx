import ChatInterface from '@/components/planner/ChatInterface';

export const metadata = { title: 'AI Travel Planner — AI Flight Assistant' };

export default function PlannerPage() {
  return (
    <main className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <ChatInterface />
    </main>
  );
}
