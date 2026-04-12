import BottomNav from '@/components/BottomNav';

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-accent">PocketWatch</h1>
        <p className="text-sm text-text-muted mt-1">Your financial accountability buddy</p>
      </header>
      <main className="px-4">
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <p className="text-text-muted">Dashboard coming soon</p>
          <p className="text-xs text-text-muted mt-2">Connect your bank to get started</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
