import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign In — AI Flight Assistant' };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AI Flight Assistant</h1>
          <p className="text-slate-500 mt-2">Sign in to search flights and plan group travel</p>
        </div>
        {/* Suspense required because LoginForm uses useSearchParams() */}
        <Suspense
          fallback={
            <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
