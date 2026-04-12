import BottomNav from '@/components/BottomNav';

export default function AlertsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <div className="h-8 w-24 bg-surface rounded animate-pulse" />
      </header>
      <main className="px-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-surface border border-border p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-surface-elevated rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
                <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
