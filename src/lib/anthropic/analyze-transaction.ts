import { anthropic } from './client';
import { TRANSACTION_SYSTEM_PROMPT } from './prompts';
import { saveMerchantMapping } from '@/lib/categories';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AnalysisResult {
  alert_needed: boolean;
  severity: 'info' | 'nudge' | 'warning' | 'urgent';
  message: string;
  budget_note: string;
  suggested_category?: string;
}

export async function analyzeTransaction(
  transaction: { id: string; merchant_name: string; amount: number; date: string; category: string },
  supabase: SupabaseClient
): Promise<AnalysisResult> {
  // 1. Gather context
  const [budgetStatusRes, recentTxnsRes, alertsTodayRes, alertsWeekRes, incomeRes] =
    await Promise.all([
      supabase.from('budget_status').select('*'),
      supabase
        .from('transactions')
        .select('date, merchant_name, amount, category')
        .order('date', { ascending: false })
        .limit(10),
      supabase.rpc('alerts_in_window', { hours_back: 24 }),
      supabase.rpc('alerts_in_window', { hours_back: 168 }),
      supabase.from('settings').select('value').eq('key', 'income').single(),
    ]);

  const budgetStatus = budgetStatusRes.data || [];
  const recentTxns = recentTxnsRes.data || [];
  const alertsToday = (alertsTodayRes.data as number) || 0;
  const alertsThisWeek = (alertsWeekRes.data as number) || 0;
  const income = incomeRes.data?.value as { monthly_takehome?: number; next_payday?: string } | null;

  // 2. Build context message
  const userMessage = `
NEW_TRANSACTION:
  Merchant: ${transaction.merchant_name}
  Amount: $${transaction.amount}
  Date: ${transaction.date}
  Category: ${transaction.category}

BUDGET_STATUS:
${budgetStatus
  .map(
    (b: Record<string, unknown>) =>
      `  ${b.category}: $${b.spent_this_month} / $${b.monthly_limit} (${b.pct_used}% used, $${b.remaining} remaining)${b.is_frozen ? ' [FROZEN]' : ''}`
  )
  .join('\n')}

RECENT_TRANSACTIONS (last 10):
${recentTxns
  .map(
    (t: Record<string, unknown>) =>
      `  ${t.date} | ${t.merchant_name} | $${t.amount} | ${t.category}`
  )
  .join('\n')}

ALERTS_TODAY: ${alertsToday}
ALERTS_THIS_WEEK: ${alertsThisWeek}
DAY_OF_MONTH: ${new Date().getDate()}
INCOME: $${income?.monthly_takehome || 2714}/mo, next payday: ${income?.next_payday || 'unknown'}

Analyze this transaction and respond with JSON only.`;

  // 3. Call Haiku
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: TRANSACTION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  // 4. Parse response
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result: AnalysisResult = JSON.parse(cleaned);

    // If Claude suggested a category for an unknown merchant, save the mapping
    if (result.suggested_category && transaction.category === 'Other') {
      await saveMerchantMapping(transaction.merchant_name, result.suggested_category, supabase);

      // Update the transaction's category
      await supabase
        .from('transactions')
        .update({ category: result.suggested_category })
        .eq('id', transaction.id);
    }

    // If alert needed, store it
    if (result.alert_needed) {
      await supabase.from('alerts').insert({
        transaction_id: transaction.id,
        severity: result.severity,
        message: result.message,
        budget_note: result.budget_note,
      });
    }

    // Mark transaction as analyzed
    await supabase
      .from('transactions')
      .update({ analyzed: true })
      .eq('id', transaction.id);

    return result;
  } catch (err) {
    console.error('Failed to parse Claude response:', text);
    // Mark as analyzed even on parse failure to avoid reprocessing
    await supabase
      .from('transactions')
      .update({ analyzed: true })
      .eq('id', transaction.id);
    return { alert_needed: false, severity: 'info', message: '', budget_note: 'Parse error' };
  }
}
