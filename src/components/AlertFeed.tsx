import type { Alert } from '@/lib/supabase/types';
import AlertCard from './AlertCard';

export default function AlertFeed({
  alerts,
  onMarkRead,
}: {
  alerts: Alert[];
  onMarkRead?: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 text-center">
        <p className="text-text-muted">No alerts yet</p>
        <p className="text-xs text-text-muted mt-2">
          Alerts will appear here when transactions need attention
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}
