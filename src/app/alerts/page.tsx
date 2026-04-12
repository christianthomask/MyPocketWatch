'use client';

import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import AlertFeed from '@/components/AlertFeed';
import BottomNav from '@/components/BottomNav';
import type { Severity } from '@/lib/constants';

const FILTERS: { label: string; value: Severity | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '\uD83D\uDEA8 Urgent', value: 'urgent' },
  { label: '\u26A0\uFE0F Warning', value: 'warning' },
  { label: '\uD83D\uDC40 Nudge', value: 'nudge' },
  { label: '\u2705 Info', value: 'info' },
];

const DOMAIN_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: '\uD83D\uDCB0 Financial', value: 'financial' },
  { label: '\uD83D\uDCD6 Spiritual', value: 'spiritual' },
  { label: '\uD83D\uDCAA Health', value: 'health' },
  { label: '\uD83C\uDF19 Sleep', value: 'sleep' },
  { label: '\uD83C\uDF7D Meals', value: 'meals' },
  { label: '\uD83D\uDCBB Career', value: 'career' },
];

export default function AlertsPage() {
  const { alerts, loading, markAsRead, markAllAsRead } = useAlerts(50);
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const filtered = alerts.filter((a) => {
    const matchesSeverity = filter === 'all' || a.severity === filter;
    const matchesDomain = domainFilter === 'all' || (a as Record<string, unknown>).domain === domainFilter;
    return matchesSeverity && matchesDomain;
  });
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Alerts</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-accent"
            >
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </header>

      <div className="px-4 mb-2 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-accent text-background'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1">
        {DOMAIN_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setDomainFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              domainFilter === f.value
                ? 'bg-accent text-background'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <main className="px-4">
        {loading ? (
          <div className="rounded-xl bg-surface border border-border p-6 text-center">
            <p className="text-text-muted text-sm">Loading alerts...</p>
          </div>
        ) : (
          <AlertFeed alerts={filtered} onMarkRead={markAsRead} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
