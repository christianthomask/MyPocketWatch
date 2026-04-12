import { anthropic } from './client';
import { WEEKLY_REPORT_SYSTEM_PROMPT } from './prompts';
import { createAdminClient } from '@/lib/supabase/admin';

interface WeeklyReportResult {
  summary: string;
  total_spent: number;
  weekly_target: number;
  on_track: boolean;
  wins: string[];
  concerns: string[];
  suggestion: string;
  forecast_monthly_total: number;
  category_breakdown: Record<string, number>;
}

export async function generateWeeklyReport(
  weekStart: string,
  weekEnd: string
): Promise<WeeklyReportResult> {
  const supabase = createAdminClient();

  // 1. Gather week's data
  const [txnsRes, budgetRes, alertsRes, incomeRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .eq('pending', false)
      .order('date', { ascending: false }),
    supabase.from('budget_status').select('*'),
    supabase
      .from('alerts')
      .select('severity, message, created_at')
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd + 'T23:59:59Z'),
    supabase.from('settings').select('value').eq('key', 'income').single(),
  ]);

  const transactions = txnsRes.data || [];
  const budgetStatus = budgetRes.data || [];
  const alerts = alertsRes.data || [];
  const income = incomeRes.data?.value as { monthly_takehome?: number } | null;

  // 2. Calculate totals
  const totalSpent = transactions.reduce(
    (sum: number, t: { amount: number }) => sum + Number(t.amount),
    0
  );

  const categoryTotals: Record<string, number> = {};
  for (const t of transactions) {
    const cat = (t as { category: string }).category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number((t as { amount: number }).amount);
  }

  // 3. Build prompt
  const userMessage = `
WEEK: ${weekStart} to ${weekEnd}
TOTAL SPENT: $${totalSpent.toFixed(2)}
WEEKLY TARGET: $625 ($2,500/month ÷ 4)

TRANSACTIONS THIS WEEK (${transactions.length}):
${transactions
  .map(
    (t: { date: string; merchant_name: string; amount: number; category: string }) =>
      `  ${t.date} | ${t.merchant_name} | $${Number(t.amount).toFixed(2)} | ${t.category}`
  )
  .join('\n')}

CATEGORY BREAKDOWN:
${Object.entries(categoryTotals)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `  ${cat}: $${amt.toFixed(2)}`)
  .join('\n')}

CURRENT BUDGET STATUS:
${budgetStatus
  .map(
    (b: Record<string, unknown>) =>
      `  ${b.category}: $${b.spent_this_month} / $${b.monthly_limit} (${b.pct_used}%)${b.is_frozen ? ' [FROZEN]' : ''}`
  )
  .join('\n')}

ALERTS THIS WEEK: ${alerts.length}
${alerts
  .map((a: { severity: string; message: string }) => `  [${a.severity}] ${a.message}`)
  .join('\n')}

INCOME: $${income?.monthly_takehome || 2714}/month

Generate the weekly report as JSON.`;

  // 4. Call Sonnet
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: WEEKLY_REPORT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result: WeeklyReportResult = JSON.parse(cleaned);

    // 5. Store in database
    await supabase.from('weekly_reports').insert({
      week_start: weekStart,
      week_end: weekEnd,
      total_spent: result.total_spent || totalSpent,
      report_data: result.category_breakdown || categoryTotals,
      summary: result.summary,
      wins: result.wins,
      concerns: result.concerns,
      suggestion: result.suggestion,
    });

    return result;
  } catch (err) {
    console.error('Failed to parse weekly report:', text);
    // Store a fallback report
    const fallback: WeeklyReportResult = {
      summary: `You spent $${totalSpent.toFixed(2)} this week.`,
      total_spent: totalSpent,
      weekly_target: 625,
      on_track: totalSpent <= 625,
      wins: [],
      concerns: [],
      suggestion: 'Review your spending manually this week.',
      forecast_monthly_total: totalSpent * 4,
      category_breakdown: categoryTotals,
    };

    await supabase.from('weekly_reports').insert({
      week_start: weekStart,
      week_end: weekEnd,
      total_spent: totalSpent,
      report_data: categoryTotals,
      summary: fallback.summary,
      wins: fallback.wins,
      concerns: fallback.concerns,
      suggestion: fallback.suggestion,
    });

    return fallback;
  }
}
