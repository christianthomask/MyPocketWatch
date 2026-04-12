import type { BudgetStatus } from '@/lib/supabase/types';
import BudgetBar from './BudgetBar';

export default function BudgetGrid({ budgets }: { budgets: BudgetStatus[] }) {
  if (budgets.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 text-center">
        <p className="text-text-muted">No budget data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {budgets.map((budget) => (
        <BudgetBar key={budget.category} budget={budget} />
      ))}
    </div>
  );
}
