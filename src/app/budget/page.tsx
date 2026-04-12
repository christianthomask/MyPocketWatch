'use client';

import { useBudgetStatus } from '@/hooks/useBudgetStatus';
import BudgetGrid from '@/components/BudgetGrid';
import BottomNav from '@/components/BottomNav';
import { MONTHLY_INCOME } from '@/lib/constants';

export default function BudgetPage() {
  const { data: budgets, loading } = useBudgetStatus();

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_this_month), 0);
  const essentialSpent = budgets
    .filter((b) => b.is_essential)
    .reduce((sum, b) => sum + Number(b.spent_this_month), 0);
  const discretionarySpent = totalSpent - essentialSpent;

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Budget</h1>
      </header>

      <main className="px-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface border border-border p-3">
            <p className="text-xs text-text-muted">Total Budget</p>
            <p className="text-lg font-bold">${totalBudget.toFixed(0)}</p>
          </div>
          <div className="rounded-lg bg-surface border border-border p-3">
            <p className="text-xs text-text-muted">Remaining Income</p>
            <p className="text-lg font-bold">${(MONTHLY_INCOME - totalSpent).toFixed(0)}</p>
          </div>
          <div className="rounded-lg bg-surface border border-border p-3">
            <p className="text-xs text-text-muted">Essential</p>
            <p className="text-lg font-bold">${essentialSpent.toFixed(0)}</p>
          </div>
          <div className="rounded-lg bg-surface border border-border p-3">
            <p className="text-xs text-text-muted">Discretionary</p>
            <p className="text-lg font-bold">${discretionarySpent.toFixed(0)}</p>
          </div>
        </div>

        {/* Budget Bars */}
        {loading ? (
          <div className="rounded-xl bg-surface border border-border p-6 text-center">
            <p className="text-text-muted text-sm">Loading budgets...</p>
          </div>
        ) : (
          <BudgetGrid budgets={budgets} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
