import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

const GUIDES = [
  { href: '/guides/schedule', icon: '📅', label: 'Daily Schedule', desc: 'Weekday, Saturday & Sunday templates' },
  { href: '/guides/meals', icon: '🍽', label: 'Meal Plan', desc: 'Weekly menu with macros' },
  { href: '/guides/grocery', icon: '🛒', label: 'Grocery List', desc: 'Interactive shopping checklist' },
  { href: '/guides/workout', icon: '💪', label: 'Workout', desc: 'PPL program + back protocol' },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Guides</h1>
        <p className="text-sm text-text-muted mt-1">Your Life OS reference library</p>
      </header>
      <main className="px-4 grid grid-cols-2 gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="rounded-xl bg-surface border border-border p-4 hover:border-accent/30 transition-colors"
          >
            <span className="text-2xl">{g.icon}</span>
            <p className="text-sm font-medium mt-2">{g.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{g.desc}</p>
          </Link>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
