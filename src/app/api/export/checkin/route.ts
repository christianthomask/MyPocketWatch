import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksStr = twoWeeksAgo.toISOString().split('T')[0];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    const monthStartStr = firstOfMonth.toISOString().split('T')[0];

    const [budgetRes, txnRes, alertRes, checkinRes, streakRes, goalRes, reviewRes, settingsRes, ministryRes] =
      await Promise.all([
        supabase.from('budget_status').select('*').order('pct_used', { ascending: false }),
        supabase.from('transactions').select('date, merchant_name, amount, category').gte('date', twoWeeksStr).order('date', { ascending: false }).limit(50),
        supabase.from('alerts').select('severity, message, domain, created_at').gte('created_at', oneWeekAgo.toISOString()).order('created_at', { ascending: false }).limit(20),
        supabase.from('daily_checkins').select('*').gte('date', twoWeeksStr).order('date', { ascending: false }).limit(14),
        supabase.from('streaks').select('habit, current_streak, longest_streak, last_completed'),
        supabase.from('goals').select('domain, title, target_value, current_value, unit, status').eq('status', 'active'),
        supabase.from('life_reviews').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('settings').select('key, value').in('key', ['income', 'macro_targets', 'alert_preferences']),
        supabase.from('ministry_log').select('date, hours, type').gte('date', monthStartStr),
      ]);

    const budget = budgetRes.data || [];
    const transactions = txnRes.data || [];
    const alerts = alertRes.data || [];
    const checkins = checkinRes.data || [];
    const streaks = streakRes.data || [];
    const goals = goalRes.data || [];
    const latestReview = reviewRes.data;
    const ministry = ministryRes.data || [];
    const ministryTotal = ministry.reduce((s: number, m: { hours: number }) => s + Number(m.hours), 0);

    const report = formatReport({
      date: new Date(),
      budget,
      transactions,
      alerts,
      checkins,
      streaks,
      goals,
      latestReview,
      ministry,
      ministryTotal,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}

function formatReport(data: {
  date: Date;
  budget: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  alerts: Record<string, unknown>[];
  checkins: Record<string, unknown>[];
  streaks: Record<string, unknown>[];
  goals: Record<string, unknown>[];
  latestReview: Record<string, unknown> | null;
  ministry: Record<string, unknown>[];
  ministryTotal: number;
}): string {
  const { date, budget, transactions, checkins, streaks, goals, latestReview, alerts, ministry, ministryTotal } = data;

  const section = (title: string) => `\n\n=== ${title.toUpperCase()} ===`;

  let r = 'POCKETWATCH+ CHECK-IN REPORT';
  r += `\nGenerated: ${date.toISOString().split('T')[0]}`;
  r += `\nPeriod: Last 14 days`;

  // ── BUDGET STATUS ──
  r += section('Budget Status (Current Month)');
  if (budget.length) {
    for (const b of budget) {
      const pct = Number(b.pct_used);
      const bar = pct > 100 ? '🔴' : pct > 70 ? '🟡' : '🟢';
      r += `\n  ${bar} ${b.category}: $${b.spent_this_month} / $${b.monthly_limit} (${pct}%)${b.is_frozen ? ' [FROZEN]' : ''}`;
    }
    const totalSpent = budget.reduce((s: number, b) => s + Number(b.spent_this_month), 0);
    const totalBudget = budget.reduce((s: number, b) => s + Number(b.monthly_limit), 0);
    r += `\n  ── Total: $${totalSpent.toFixed(0)} / $${totalBudget.toFixed(0)}`;
  }

  // ── TRANSACTIONS ──
  r += section('Recent Transactions (14 days)');
  if (transactions.length) {
    const byCat: Record<string, { total: number; count: number }> = {};
    for (const t of transactions) {
      const cat = t.category as string;
      if (!byCat[cat]) byCat[cat] = { total: 0, count: 0 };
      byCat[cat].total += Number(t.amount);
      byCat[cat].count += 1;
    }
    for (const [cat, d] of Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)) {
      r += `\n  ${cat}: $${d.total.toFixed(0)} (${d.count} transactions)`;
    }
    r += `\n\n  Last 10 transactions:`;
    for (const t of transactions.slice(0, 10)) {
      r += `\n    ${t.date} | ${t.merchant_name} | $${t.amount} | ${t.category}`;
    }
  }

  // ── STREAKS ──
  r += section('Habit Streaks');
  if (streaks.length) {
    for (const s of streaks) {
      const emoji = Number(s.current_streak) > 0 ? '🔥' : '⬜';
      r += `\n  ${emoji} ${s.habit}: ${s.current_streak} days (best: ${s.longest_streak})`;
    }
  }

  // ── CHECK-IN SUMMARY ──
  r += section('Daily Check-Ins (14 days)');
  if (checkins.length) {
    const days = checkins.length;
    const bibleDays = checkins.filter((c) => c.bible_reading).length;
    const gymDays = checkins.filter((c) => c.gym_completed).length;
    const packedLunch = checkins.filter((c) => c.packed_lunch).length;
    const phoneAway = checkins.filter((c) => c.phone_away_by_930).length;
    const mealsCooked = checkins.reduce((s: number, c) => s + (Number(c.meals_cooked) || 0), 0);
    const mealsOut = checkins.reduce((s: number, c) => s + (Number(c.meals_eaten_out) || 0), 0);
    const codingMin = checkins.reduce((s: number, c) => s + (Number(c.coding_minutes) || 0), 0);
    const writingMin = checkins.reduce((s: number, c) => s + (Number(c.writing_minutes) || 0), 0);

    r += `\n  Days with check-ins: ${days}/14`;
    r += `\n  📖 Bible reading: ${bibleDays}/${days} days`;
    r += `\n  💪 Gym sessions: ${gymDays}`;
    r += `\n  🍱 Packed lunch: ${packedLunch}/${days} days`;
    r += `\n  📱 Phone away by 9:30: ${phoneAway}/${days} days`;
    r += `\n  🍳 Meals cooked: ${mealsCooked} | Eaten out: ${mealsOut}`;
    r += `\n  💻 Coding: ${Math.floor(codingMin / 60)}h ${codingMin % 60}m total`;
    r += `\n  ✍️ Writing: ${Math.floor(writingMin / 60)}h ${writingMin % 60}m total`;

    const bedtimes = checkins.filter((c) => c.bedtime).map((c) => c.bedtime);
    if (bedtimes.length > 0) {
      r += `\n  🕙 Bedtimes logged: ${bedtimes.join(', ')}`;
    }

    const moods = checkins.filter((c) => c.mood).map((c) => Number(c.mood));
    if (moods.length > 0) {
      const avgMood = (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1);
      r += `\n  😊 Avg mood: ${avgMood}/5`;
    }

    const wins = checkins.filter((c) => c.daily_win).map((c) => `${c.date}: ${c.daily_win}`);
    const struggles = checkins.filter((c) => c.daily_struggle).map((c) => `${c.date}: ${c.daily_struggle}`);
    if (wins.length > 0) {
      r += `\n\n  Recent wins:`;
      for (const w of wins.slice(0, 5)) r += `\n    ✅ ${w}`;
    }
    if (struggles.length > 0) {
      r += `\n  Recent struggles:`;
      for (const s of struggles.slice(0, 5)) r += `\n    ⚠️ ${s}`;
    }
  }

  // ── GOALS ──
  r += section('Goal Progress');
  if (goals.length) {
    for (const g of goals) {
      const target = Number(g.target_value) || 0;
      const current = Number(g.current_value) || 0;
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      const emoji = pct > 70 ? '🟢' : pct > 30 ? '🟡' : '⬜';
      r += `\n  ${emoji} [${g.domain}] ${g.title}: ${current}/${target} ${g.unit} (${pct}%)`;
    }
  }

  // ── MINISTRY ──
  r += section('Ministry (This Month)');
  r += `\n  Total hours: ${ministryTotal}`;
  if (ministry.length) {
    for (const m of ministry) {
      r += `\n    ${m.date}: ${m.hours}h (${m.type})`;
    }
  }

  // ── ALERTS ──
  r += section('Recent Alerts (7 days)');
  if (alerts.length) {
    for (const a of alerts) {
      const emoji = a.severity === 'urgent' ? '🚨' : a.severity === 'warning' ? '⚠️' : a.severity === 'nudge' ? '👀' : '✅';
      r += `\n  ${emoji} [${a.domain}] ${a.message}`;
    }
  } else {
    r += `\n  No alerts this week.`;
  }

  // ── LATEST WEEKLY REVIEW ──
  if (latestReview) {
    r += section('Latest Weekly Review');
    r += `\n  Week: ${latestReview.week_start} to ${latestReview.week_end}`;
    r += `\n  Grade: ${latestReview.overall_grade || 'N/A'}`;
    r += `\n\n${latestReview.summary}`;
    if (Array.isArray(latestReview.wins) && latestReview.wins.length) {
      r += `\n\n  Wins:`;
      for (const w of latestReview.wins) r += `\n    ✅ ${w}`;
    }
    if (Array.isArray(latestReview.struggles) && latestReview.struggles.length) {
      r += `\n  Struggles:`;
      for (const s of latestReview.struggles) r += `\n    ⚠️ ${s}`;
    }
    if (latestReview.suggestion) {
      r += `\n\n  Suggestion: ${latestReview.suggestion}`;
    }
  }

  r += `\n\n=== END OF REPORT ===`;
  r += `\n(Paste this into Claude for a deep-dive coaching session)`;

  return r;
}
