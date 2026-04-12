import BottomNav from '@/components/BottomNav';

export default function SetupPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Setup</h1>
        <p className="text-sm text-text-muted mt-1">Connect your bank account</p>
      </header>
      <main className="px-4">
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <p className="text-text-muted">Plaid Link integration coming soon</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
