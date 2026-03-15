import SignupForm from '@/components/auth/SignupForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create Account — AI Flight Assistant' };

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AI Flight Assistant</h1>
          <p className="text-slate-500 mt-2">Create an account to get started</p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
