'use client';

const MOODS = [
  { value: 1, label: 'Rough', emoji: '😔' },
  { value: 2, label: 'Meh', emoji: '😕' },
  { value: 3, label: 'OK', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😄' },
];

export default function MoodRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            value === mood.value
              ? 'bg-accent/20 ring-1 ring-accent'
              : 'hover:bg-surface-elevated'
          }`}
        >
          <span className="text-xl">{mood.emoji}</span>
          <span className="text-[10px] text-text-muted">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
