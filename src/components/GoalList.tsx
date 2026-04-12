import type { Goal } from '@/lib/supabase/types';
import GoalCard from './GoalCard';

export default function GoalList({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 text-center">
        <p className="text-text-muted text-sm">No active goals</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
