import type { LifeReview } from '@/lib/supabase/types';
import type { Json } from '@/lib/supabase/types';
import DomainScore from './DomainScore';

const DOMAIN_ICONS: Record<string, string> = {
  spiritual: '📖',
  financial: '💰',
  health: '💪',
  career: '💻',
  sleep: '🌙',
  meals: '🍽',
};

export default function LifeReviewCard({ review }: { review: LifeReview }) {
  const scores = (review.domain_scores || {}) as Record<string, string>;

  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">
            Week of {new Date(review.week_start).toLocaleDateString()}
          </h3>
          <p className="text-xs text-text-muted">
            {new Date(review.week_start).toLocaleDateString()} — {new Date(review.week_end).toLocaleDateString()}
          </p>
        </div>
        {review.overall_grade && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
            review.overall_grade.startsWith('A') ? 'bg-success/10 text-success ring-1 ring-success/30' :
            review.overall_grade.startsWith('B') ? 'bg-accent/10 text-accent ring-1 ring-accent/30' :
            review.overall_grade.startsWith('C') ? 'bg-warning/10 text-warning ring-1 ring-warning/30' :
            'bg-danger/10 text-danger ring-1 ring-danger/30'
          }`}>
            {review.overall_grade}
          </div>
        )}
      </div>

      {/* Domain Scores */}
      {Object.keys(scores).length > 0 && (
        <div className="flex justify-between mb-4 px-2">
          {Object.entries(DOMAIN_ICONS).map(([domain, icon]) => (
            <DomainScore
              key={domain}
              domain={domain}
              grade={scores[domain] || '—'}
              icon={icon}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line mb-3">
        {review.summary}
      </p>

      {/* Wins */}
      {review.wins && review.wins.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-success mb-1">Wins</p>
          {review.wins.map((win, i) => (
            <p key={i} className="text-xs text-text-muted">✓ {win}</p>
          ))}
        </div>
      )}

      {/* Struggles */}
      {review.struggles && review.struggles.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-warning mb-1">Struggles</p>
          {review.struggles.map((s, i) => (
            <p key={i} className="text-xs text-text-muted">• {s}</p>
          ))}
        </div>
      )}

      {/* Suggestion */}
      {review.suggestion && (
        <div className="rounded-lg bg-accent/10 p-3">
          <p className="text-xs font-medium text-accent mb-1">Focus for next week</p>
          <p className="text-xs text-text-muted">{review.suggestion}</p>
        </div>
      )}
    </div>
  );
}
