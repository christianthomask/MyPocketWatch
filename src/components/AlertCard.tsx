import type { Alert } from '@/lib/supabase/types';
import { SEVERITY_CONFIG, type Severity } from '@/lib/constants';

export default function AlertCard({
  alert,
  onMarkRead,
}: {
  alert: Alert;
  onMarkRead?: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity as Severity];
  const timeAgo = getTimeAgo(alert.created_at);

  return (
    <div
      className={`rounded-lg bg-surface border border-border p-4 ${
        !alert.acknowledged ? 'border-l-2 border-l-accent' : 'opacity-75'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{config?.icon || '\u{1F4CC}'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${config?.color || 'text-text-muted'}`}>
              {config?.label || alert.severity}
            </span>
            <span className="text-xs text-text-muted">{timeAgo}</span>
          </div>
          <p className="text-sm leading-relaxed">{alert.message}</p>
        </div>
        {!alert.acknowledged && onMarkRead && (
          <button
            onClick={() => onMarkRead(alert.id)}
            className="text-xs text-text-muted hover:text-foreground flex-shrink-0"
          >
            {'\u2713'}
          </button>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
