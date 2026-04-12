'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { WeeklyReport } from '@/lib/supabase/types';
import BottomNav from '@/components/BottomNav';

export default function ReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const supabase = createClient();
      const { data } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(10);
      setReports((data as WeeklyReport[]) || []);
      setLoading(false);
    }
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
      </header>

      <main className="px-4">
        {loading ? (
          <div className="rounded-xl bg-surface border border-border p-6 text-center">
            <p className="text-text-muted text-sm">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl bg-surface border border-border p-6 text-center">
            <p className="text-text-muted">No reports yet</p>
            <p className="text-xs text-text-muted mt-2">
              Weekly reports are generated every Sunday
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
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
                      <p key={i} className="text-xs text-text-muted">&check; {win}</p>
                    ))}
                  </div>
                )}
                {report.concerns && report.concerns.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-warning mb-1">Watch</p>
                    {report.concerns.map((concern, i) => (
                      <p key={i} className="text-xs text-text-muted">&bull; {concern}</p>
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
        )}
      </main>

      <BottomNav />
    </div>
  );
}
