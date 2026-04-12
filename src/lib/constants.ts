export const SEVERITY_LEVELS = ['info', 'nudge', 'warning', 'urgent'] as const;
export type Severity = typeof SEVERITY_LEVELS[number];

export const ALERT_LIMITS = {
  MAX_DAILY: 3,
  MAX_WEEKLY: 10,
} as const;

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: string }> = {
  info: { label: 'Info', color: 'text-info', icon: '✅' },
  nudge: { label: 'Nudge', color: 'text-accent', icon: '👀' },
  warning: { label: 'Warning', color: 'text-warning', icon: '⚠️' },
  urgent: { label: 'Urgent', color: 'text-danger', icon: '🚨' },
};

export const BUDGET_CATEGORIES = [
  'Rent',
  'Groceries',
  'Fast Food',
  'Coffee & Cafes',
  'Restaurants',
  'Gas & Fuel',
  'Auto Insurance',
  'MindPath',
  'Planet Fitness',
  'Supplements',
  'Spotify',
  'AI & Tech',
  'Apple Subs',
  'Retail & Shopping',
  'Convenience Stores',
  'Transfers to Friends',
  'Other',
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

export const WEEKLY_TARGET = 625; // $2,500/mo ÷ 4 weeks
export const MONTHLY_INCOME = 2714;

// ============================================
// PocketWatch+ Life Domains
// ============================================
export const LIFE_DOMAINS = ['spiritual', 'health', 'financial', 'sleep', 'meals', 'career'] as const;
export type LifeDomain = typeof LIFE_DOMAINS[number];

export const HABITS = [
  'bible_reading', 'gym', 'packed_lunch', 'bed_by_1030',
  'no_eating_out', 'phone_away_930', 'coding',
] as const;
export type Habit = typeof HABITS[number];

export const DOMAIN_CONFIG: Record<LifeDomain, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  habits: readonly string[];
}> = {
  spiritual: {
    label: 'Bible',
    icon: '📖',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    habits: ['bible_reading'],
  },
  health: {
    label: 'Gym',
    icon: '💪',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    habits: ['gym'],
  },
  financial: {
    label: 'Budget',
    icon: '💰',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    habits: ['no_eating_out'],
  },
  sleep: {
    label: 'Sleep',
    icon: '🌙',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    habits: ['bed_by_1030', 'phone_away_930'],
  },
  meals: {
    label: 'Meals',
    icon: '🍽',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    habits: ['packed_lunch', 'no_eating_out'],
  },
  career: {
    label: 'Code',
    icon: '💻',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    habits: ['coding'],
  },
};
