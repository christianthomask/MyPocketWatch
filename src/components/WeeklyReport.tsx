import type { WeeklyReport as WeeklyReportType } from '@/lib/supabase/types';

export default function WeeklyReport({ report }: { report: WeeklyReportType }) {
  const reportData = report.report_data as Record<string, number> | null;

  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          Week of {new Date(report.week_start).toLocaleDateString()}
        </h3>
        <span className="text-sm font-medium text-accent">
          ${Number(report.total_spent).toFixed(0)}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
        {report.summary}
      </p>

      {/* Category Breakdown */}
      {reportData && Object.keys(reportData).length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-foreground mb-2">Category Breakdown</p>
          <div className="space-y-1.5">
            {Object.entries(reportData)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{category}</span>
                  <span className="font-medium">${Number(amount).toFixed(0)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Wins */}
      {report.wins && report.wins.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-success mb-1">Wins</p>
          {report.wins.map((win, i) => (
            <p key={i} className="text-xs text-text-muted">
              {win}
            </p>
          ))}
        </div>
      )}

      {/* Concerns */}
      {report.concerns && report.concerns.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-warning mb-1">Watch</p>
          {report.concerns.map((concern, i) => (
            <p key={i} className="text-xs text-text-muted">
              {concern}
            </p>
          ))}
        </div>
      )}

      {/* Suggestion */}
      {report.suggestion && (
        <div className="mt-4 rounded-lg bg-accent/10 p-3">
          <p className="text-xs font-medium text-accent mb-1">Suggestion for next week</p>
          <p className="text-xs text-text-muted">{report.suggestion}</p>
        </div>
      )}
    </div>
  );
}
