import { anthropic } from './client';
import { CONTEXTUAL_ALERT_SYSTEM_PROMPT } from './prompts';
import { createAdminClient } from '@/lib/supabase/admin';
import { dispatchAlert } from '@/lib/alerts/dispatch';

interface ContextualAnalysisResult {
  alert_needed: boolean;
  domain: string;
  severity: 'info' | 'nudge' | 'warning';
  message: string;
  trigger: string;
}

export async function analyzeCheckinContext(): Promise<ContextualAnalysisResult> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // Gather context
  const [checkinRes, streaksRes, recentCheckinsRes, alertsTodayRes, txnsRes] = await Promise.all([
    supabase.from('daily_checkins').select('*').eq('date', today).maybeSingle(),
    supabase.from('streaks').select('*'),
    supabase.from('daily_checkins').select('*').order('date', { ascending: false }).limit(7),
    supabase.from('alerts').select('domain, severity').gte('created_at', today + 'T00:00:00Z'),
    supabase.from('transactions').select('merchant_name, amount, category, date').order('date', { ascending: false }).limit(10),
  ]);

  const todayCheckin = checkinRes.data;
  const streaks = streaksRes.data || [];
  const recentCheckins = recentCheckinsRes.data || [];
  const alertsToday = alertsTodayRes.data || [];
  const recentTxns = txnsRes.data || [];

  const currentHour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0=Sun
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const userMessage = `
TODAY'S CHECK-IN (${today}):
${todayCheckin ? JSON.stringify(todayCheckin, null, 2) : 'No check-in submitted yet'}

CURRENT STREAKS:
${streaks.map((s: Record<string, unknown>) => `  ${s.habit}: ${s.current_streak} days (longest: ${s.longest_streak})`).join('\n')}

RECENT CHECK-INS (last 7 days):
${recentCheckins.map((c: Record<string, unknown>) => `  ${c.date}: bible=${c.bible_reading} gym=${c.gym_completed} lunch=${c.packed_lunch} phone_away=${c.phone_away_by_930} coding=${(c.coding_minutes as number || 0) > 0}`).join('\n')}

ALERTS ALREADY SENT TODAY: ${alertsToday.length}
DOMAINS ALERTED TODAY: ${[...new Set(alertsToday.map((a: Record<string, unknown>) => a.domain))].join(', ') || 'none'}

RECENT TRANSACTIONS:
${recentTxns.map((t: Record<string, unknown>) => `  ${t.date} | ${t.merchant_name} | $${t.amount} | ${t.category}`).join('\n')}

CURRENT TIME: ${currentHour}:00
IS WEEKEND: ${isWeekend}

Analyze the current context. Should an alert be sent? Respond with JSON only.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: CONTEXTUAL_ALERT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result: ContextualAnalysisResult = JSON.parse(cleaned);

    if (result.alert_needed) {
      // Insert alert with domain
      const { data: insertedAlert } = await supabase.from('alerts').insert({
        severity: result.severity,
        message: result.message,
        budget_note: result.trigger,
        domain: result.domain,
      }).select('id').single();

      if (insertedAlert) {
        await dispatchAlert(insertedAlert.id, result.severity, result.message);
      }
    }

    return result;
  } catch (err) {
    console.error('Failed to parse contextual analysis:', text);
    return { alert_needed: false, domain: '', severity: 'info', message: '', trigger: 'parse error' };
  }
}
