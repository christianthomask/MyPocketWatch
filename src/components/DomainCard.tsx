import StreakBadge from './StreakBadge';

interface DomainCardProps {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  status: string;       // e.g., "✅ 7-day streak" or "$142 left"
  detail?: string;      // e.g., "on track" or "Push day"
  streak?: number;
  done?: boolean;       // today's check-in status
}

export default function DomainCard({
  icon,
  label,
  color,
  bgColor,
  status,
  detail,
  streak,
  done,
}: DomainCardProps) {
  return (
    <div className={`rounded-xl border border-border p-3 ${done ? bgColor : 'bg-surface'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs font-medium ${color}`}>{label}</span>
      </div>
      <p className="text-sm font-medium truncate">{status}</p>
      {detail && <p className="text-xs text-text-muted mt-0.5">{detail}</p>}
      {streak !== undefined && streak > 0 && (
        <div className="mt-1.5">
          <StreakBadge count={streak} />
        </div>
      )}
    </div>
  );
}
