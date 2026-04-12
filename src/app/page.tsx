'use client';

import { useBudgetStatus } from '@/hooks/useBudgetStatus';
import { useAlerts } from '@/hooks/useAlerts';
import { useStreaks } from '@/hooks/useStreaks';
import { useCheckin } from '@/hooks/useCheckin';
import { useGoals } from '@/hooks/useGoals';
import DomainGrid from '@/components/DomainGrid';
import AlertCard from '@/components/AlertCard';
import GoalList from '@/components/GoalList';
import BottomNav from '@/components/BottomNav';
import { DOMAIN_CONFIG, MONTHLY_INCOME } from '@/lib/constants';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: budgets, loading: budgetsLoading } = useBudgetStatus();
  const { alerts, loading: alertsLoading, markAsRead } = useAlerts(5);
  const { streaks, getStreak } = useStreaks();
  const { checkin } = useCheckin();
  const { goals, loading: goalsLoading } = useGoals();

  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_this_month), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);

  // Build domain data for the grid
  const domainData = [
    {
      ...DOMAIN_CONFIG.spiritual,
      status: checkin?.bible_reading ? 'Read today' : 'Not yet',
      detail: getStreak('bible_reading')?.current_streak
        ? `${getStreak('bible_reading')!.current_streak}-day streak`
        : undefined,
      streak: getStreak('bible_reading')?.current_streak || 0,
      done: !!checkin?.bible_reading,
    },
    {
      ...DOMAIN_CONFIG.health,
      status: checkin?.gym_completed ? 'Done!' : 'Gym day?',
      detail: checkin?.gym_workout || undefined,
      streak: getStreak('gym')?.current_streak || 0,
      done: !!checkin?.gym_completed,
    },
    {
      ...DOMAIN_CONFIG.financial,
      status: `$${Math.max(0, totalBudget - totalSpent).toFixed(0)} left`,
      detail: totalSpent / totalBudget < 0.7 ? 'on track' : 'watch it',
      streak: undefined,
      done: totalSpent / totalBudget < 0.7,
    },
    {
      ...DOMAIN_CONFIG.sleep,
      status: checkin?.phone_away_by_930 ? 'Phone away ✓' : 'Tonight',
      detail: getStreak('phone_away_930')?.current_streak
        ? `${getStreak('phone_away_930')!.current_streak}-day streak`
        : undefined,
      streak: getStreak('phone_away_930')?.current_streak || 0,
      done: !!checkin?.phone_away_by_930,
    },
    {
      ...DOMAIN_CONFIG.meals,
      status: checkin?.packed_lunch ? 'Lunch packed ✓' : 'Pack lunch?',
      detail: checkin
        ? `${checkin.meals_cooked || 0} cooked, ${checkin.meals_eaten_out || 0} out`
        : undefined,
      streak: getStreak('packed_lunch')?.current_streak || 0,
      done: !!checkin?.packed_lunch,
    },
    {
      ...DOMAIN_CONFIG.career,
      status: (checkin?.coding_minutes || 0) > 0
        ? `${checkin!.coding_minutes}min today`
        : '0 min today',
      detail: checkin?.coding_project || undefined,
      streak: getStreak('coding')?.current_streak || 0,
      done: (checkin?.coding_minutes || 0) > 0,
    },
  ];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-accent">PocketWatch+</h1>
        <p className="text-sm text-text-muted mt-1">{greeting}, Christian — {today}</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Domain Grid */}
        <DomainGrid domains={domainData} />

        {/* Quick Check-In CTA */}
        {!checkin && (
          <Link
            href="/checkin"
            className="block w-full rounded-xl bg-accent/10 border border-accent/20 p-4 text-center"
          >
            <p className="text-accent font-medium">✅ Daily Check-In</p>
            <p className="text-xs text-text-muted mt-1">Take 30 seconds to log your day</p>
          </Link>
        )}

        {/* Spending Summary */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-sm font-semibold">Monthly Spending</h2>
            <Link href="/budget" className="text-xs text-accent">Details →</Link>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${totalSpent.toFixed(0)}</span>
            <span className="text-text-muted text-sm">/ ${totalBudget.toFixed(0)}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpent / totalBudget > 0.8 ? 'bg-danger' :
                totalSpent / totalBudget > 0.6 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            ${(MONTHLY_INCOME - totalSpent).toFixed(0)} remaining from income
          </p>
        </div>

        {/* Goals */}
        {!goalsLoading && goals.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2">Goals</h2>
            <GoalList goals={goals.slice(0, 4)} />
          </div>
        )}

        {/* Recent Alerts */}
        {!alertsLoading && alerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Recent Alerts</h2>
              <Link href="/alerts" className="text-xs text-accent">View all →</Link>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} onMarkRead={markAsRead} />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
