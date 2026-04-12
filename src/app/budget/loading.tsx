import BottomNav from '@/components/BottomNav';

export default function BudgetLoading() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <div className="h-8 w-24 bg-surface rounded animate-pulse" />
      </header>
      <main className="px-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-surface border border-border p-3 h-16 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-surface border border-border p-3 h-14 animate-pulse" />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
