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
