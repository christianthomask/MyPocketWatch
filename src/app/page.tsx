'use client';

import { useBudgetStatus } from '@/hooks/useBudgetStatus';
import { useAlerts } from '@/hooks/useAlerts';
import BudgetGrid from '@/components/BudgetGrid';
import AlertCard from '@/components/AlertCard';
import BottomNav from '@/components/BottomNav';
import { MONTHLY_INCOME } from '@/lib/constants';

export default function DashboardPage() {
  const { data: budgets, loading: budgetsLoading } = useBudgetStatus();
  const { alerts, loading: alertsLoading, markAsRead } = useAlerts(5);

  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_this_month), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
  const dayOfMonth = budgets[0]?.day_of_month || new Date().getDate();
  const daysInMonth = budgets[0]?.days_in_month || 30;
  const pctMonthElapsed = Math.round((dayOfMonth / daysInMonth) * 100);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-accent">PocketWatch</h1>
        <p className="text-sm text-text-muted mt-1">Your financial accountability buddy</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Spending Summary */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-lg font-semibold">This Month</h2>
            <span className="text-xs text-text-muted">Day {dayOfMonth} of {daysInMonth}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${totalSpent.toFixed(0)}</span>
            <span className="text-text-muted">/ ${totalBudget.toFixed(0)}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpent / totalBudget > pctMonthElapsed / 100
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            ${(MONTHLY_INCOME - totalSpent).toFixed(0)} remaining from ${MONTHLY_INCOME.toLocaleString()} income
          </p>
        </div>

        {/* Budget Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Budgets</h2>
            <a href="/budget" className="text-xs text-accent">View all &rarr;</a>
          </div>
          {budgetsLoading ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Loading budgets...</p>
            </div>
          ) : (
            <BudgetGrid budgets={budgets} />
          )}
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
            <a href="/alerts" className="text-xs text-accent">View all &rarr;</a>
          </div>
          {alertsLoading ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted text-sm">No alerts yet -- looking good!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} onMarkRead={markAsRead} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
