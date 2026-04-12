'use client';

import { useState } from 'react';
import { useLifeReviews } from '@/hooks/useLifeReviews';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { WeeklyReport } from '@/lib/supabase/types';
import LifeReviewCard from '@/components/LifeReviewCard';
import BottomNav from '@/components/BottomNav';

export default function ReportsPage() {
  const [tab, setTab] = useState<'life' | 'financial'>('life');
  const { reviews: lifeReviews, loading: lifeLoading } = useLifeReviews();

  // Financial reports (existing data)
  const [financialReports, setFinancialReports] = useState<WeeklyReport[]>([]);
  const [financialLoading, setFinancialLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancial() {
      const supabase = createClient();
      const { data } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(10);
      setFinancialReports((data as WeeklyReport[]) || []);
      setFinancialLoading(false);
    }
    fetchFinancial();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Reviews</h1>
      </header>

      {/* Tab Toggle */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface rounded-lg p-1 border border-border">
          <button
            onClick={() => setTab('life')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'life' ? 'bg-accent text-background' : 'text-text-muted'
            }`}
          >
            Life Reviews
          </button>
          <button
            onClick={() => setTab('financial')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'financial' ? 'bg-accent text-background' : 'text-text-muted'
            }`}
          >
            Financial
          </button>
        </div>
      </div>

      <main className="px-4">
        {tab === 'life' ? (
          lifeLoading ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Loading reviews...</p>
            </div>
          ) : lifeReviews.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted">No life reviews yet</p>
              <p className="text-xs text-text-muted mt-2">
                Weekly life reviews are generated every Sunday at 2:30 PM
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lifeReviews.map((review) => (
                <LifeReviewCard key={review.id} review={review} />
              ))}
            </div>
          )
        ) : (
          financialLoading ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Loading reports...</p>
            </div>
          ) : financialReports.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border p-6 text-center">
              <p className="text-text-muted">No financial reports yet</p>
              <p className="text-xs text-text-muted mt-2">
                Weekly financial reports are generated every Sunday
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {financialReports.map((report) => (
                <div key={report.id} className="rounded-xl bg-surface border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">
                      Week of {new Date(report.week_start).toLocaleDateString()}
                    </h3>
                    <span className="text-sm font-medium text-accent">
                      ${Number(report.total_spent).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{report.summary}</p>
                  {report.wins && report.wins.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-success mb-1">Wins</p>
                      {report.wins.map((win, i) => (
                        <p key={i} className="text-xs text-text-muted">✓ {win}</p>
                      ))}
                    </div>
                  )}
                  {report.suggestion && (
                    <div className="mt-3 rounded-lg bg-accent/10 p-2">
                      <p className="text-xs text-accent">{report.suggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>

      <BottomNav />
    </div>
  );
}
