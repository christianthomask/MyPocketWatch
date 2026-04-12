import BottomNav from '@/components/BottomNav';

export default function ReportsPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
      </header>
      <main className="px-4">
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <p className="text-text-muted">Weekly reports will appear here</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
