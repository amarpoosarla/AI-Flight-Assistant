'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function UserMenu() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (!user) return null;

  const initials = (user.email ?? 'U').split('@')[0].slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-slate-100 px-2 py-1.5 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/account/bookings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              My Bookings
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
