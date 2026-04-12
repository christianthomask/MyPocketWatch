import type { Goal } from '@/lib/supabase/types';
import { DOMAIN_CONFIG, type LifeDomain } from '@/lib/constants';

export default function GoalCard({ goal }: { goal: Goal }) {
  const config = DOMAIN_CONFIG[goal.domain as LifeDomain];
  const progress = goal.target_value
    ? Math.min((Number(goal.current_value) / Number(goal.target_value)) * 100, 100)
    : 0;

  return (
    <div className="rounded-lg bg-surface border border-border p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{config?.icon || '🎯'}</span>
        <span className="text-sm font-medium flex-1 truncate">{goal.title}</span>
        <span className={`text-xs font-medium ${config?.color || 'text-accent'}`}>
          {Number(goal.current_value).toFixed(0)}/{Number(goal.target_value).toFixed(0)} {goal.unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-accent' : 'bg-warning'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {goal.target_date && (
        <p className="text-[10px] text-text-muted mt-1">
          Target: {new Date(goal.target_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
