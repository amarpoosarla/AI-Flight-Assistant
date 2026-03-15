import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import UserMenu from '@/components/auth/UserMenu';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top nav */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-6 flex-shrink-0">
        <Link href="/flights" className="flex items-center gap-2 font-bold text-slate-900">
          <Plane className="w-4 h-4 text-brand-600" />
          <span className="text-sm">AI Flight Assistant</span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          <NavLink href="/flights">Flights</NavLink>
          <NavLink href="/planner">AI Planner</NavLink>
        </div>

        <UserMenu />
      </nav>

      <div className="flex-1">{children}</div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      {children}
    </Link>
  );
}
