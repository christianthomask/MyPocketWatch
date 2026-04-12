import BottomNav from '@/components/BottomNav';

export default function BudgetPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Budget</h1>
      </header>
      <main className="px-4">
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <p className="text-text-muted">Budget editor coming soon</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
