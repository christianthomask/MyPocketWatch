export default function StreakBadge({ count, label }: { count: number; label?: string }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
      🔥 {count}{label ? ` ${label}` : ''}
    </span>
  );
}
