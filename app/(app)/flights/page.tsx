import SearchForm from '@/components/flights/SearchForm';

export const metadata = { title: 'Search Flights — AI Flight Assistant' };

export default function FlightsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Find Your Flight</h1>
          <p className="text-slate-500 text-lg">
            Search hundreds of routes.{' '}
            <a href="/planner" className="text-brand-600 hover:underline font-medium">
              Planning group travel?
            </a>
          </p>
        </div>

        <SearchForm />
      </div>
    </main>
  );
}
