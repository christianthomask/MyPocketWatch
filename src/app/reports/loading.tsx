import BottomNav from '@/components/BottomNav';

export default function ReportsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <div className="h-8 w-28 bg-surface rounded animate-pulse" />
      </header>
      <main className="px-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface border border-border p-4 h-48 animate-pulse" />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
