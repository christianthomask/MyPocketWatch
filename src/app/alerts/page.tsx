import BottomNav from '@/components/BottomNav';

export default function AlertsPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Alerts</h1>
      </header>
      <main className="px-4">
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <p className="text-text-muted">No alerts yet</p>
          <p className="text-xs text-text-muted mt-2">Alerts will appear here when transactions need attention</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
