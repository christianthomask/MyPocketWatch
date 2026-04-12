import type { BudgetStatus } from '@/lib/supabase/types';

function getBarColor(pctUsed: number, isFrozen: boolean): string {
  if (isFrozen) return 'bg-blue-500';
  if (pctUsed >= 100) return 'bg-danger';
  if (pctUsed >= 70) return 'bg-warning';
  return 'bg-success';
}

export default function BudgetBar({ budget }: { budget: BudgetStatus }) {
  const pct = Math.min(budget.pct_used, 100);
  const barColor = getBarColor(budget.pct_used, budget.is_frozen);

  return (
    <div className="rounded-lg bg-surface border border-border p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium truncate">
          {budget.category}
          {budget.is_frozen && <span className="ml-1 text-xs text-blue-400">{'\u2744\uFE0F'}</span>}
          {budget.is_essential && <span className="ml-1 text-xs text-text-muted">{'\u2022'}</span>}
        </span>
        <span className="text-xs text-text-muted">
          ${Number(budget.spent_this_month).toFixed(0)} / ${Number(budget.monthly_limit).toFixed(0)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {budget.pct_used > 100 && (
        <p className="text-xs text-danger mt-1">
          ${Math.abs(Number(budget.remaining)).toFixed(0)} over budget
        </p>
      )}
    </div>
  );
}
