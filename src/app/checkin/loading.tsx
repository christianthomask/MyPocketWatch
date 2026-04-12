import BottomNav from '@/components/BottomNav';

export default function CheckinLoading() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <div className="h-8 w-40 bg-surface rounded animate-pulse" />
        <div className="h-4 w-32 bg-surface rounded animate-pulse mt-2" />
      </header>
      <main className="px-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
