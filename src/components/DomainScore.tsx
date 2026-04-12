const GRADE_COLORS: Record<string, string> = {
  A: 'text-success bg-success/10 ring-success/30',
  B: 'text-accent bg-accent/10 ring-accent/30',
  C: 'text-warning bg-warning/10 ring-warning/30',
  D: 'text-orange-400 bg-orange-400/10 ring-orange-400/30',
  F: 'text-danger bg-danger/10 ring-danger/30',
};

export default function DomainScore({
  domain,
  grade,
  icon,
}: {
  domain: string;
  grade: string;
  icon: string;
}) {
  const colorClass = GRADE_COLORS[grade?.charAt(0)?.toUpperCase()] || GRADE_COLORS['C'];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-full ring-1 flex items-center justify-center text-sm font-bold ${colorClass}`}>
        {grade || '—'}
      </div>
      <span className="text-[10px] text-text-muted">{icon} {domain}</span>
    </div>
  );
}
