'use client';

interface HabitToggleProps {
  icon: string;
  label: string;
  checked: boolean;
  streak: number;
  color: string;
  bgColor: string;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

export default function HabitToggle({
  icon,
  label,
  checked,
  streak,
  color,
  bgColor,
  onChange,
  children,
}: HabitToggleProps) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-full flex items-center gap-3 p-4 transition-colors ${
          checked ? bgColor : ''
        }`}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${checked ? color : 'text-foreground'}`}>
            {label}
          </p>
          {streak > 0 && (
            <p className="text-xs text-text-muted">{streak}-day streak</p>
          )}
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            checked
              ? `${color} border-current`
              : 'border-border'
          }`}
        >
          {checked && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>
      {children && checked && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
