import { anthropic } from './client';
import { LIFE_REVIEW_SYSTEM_PROMPT } from './prompts';
import { createAdminClient } from '@/lib/supabase/admin';

interface LifeReviewResult {
  summary: string;
  total_checkins: number;
  wins: string[];
  struggles: string[];
  suggestion: string;
  overall_grade: string;
  domain_scores: Record<string, string>;
}

export async function generateLifeReview(
  weekStart: string,
  weekEnd: string
): Promise<LifeReviewResult> {
  const supabase = createAdminClient();

  // Gather all data
  const [checkinsRes, streaksRes, budgetRes, txnsRes, alertsRes, goalsRes, ministryRes, prevReviewRes] =
    await Promise.all([
      supabase.from('daily_checkins').select('*').gte('date', weekStart).lte('date', weekEnd).order('date'),
      supabase.from('streaks').select('*'),
      supabase.from('budget_status').select('*'),
      supabase.from('transactions').select('*').gte('date', weekStart).lte('date', weekEnd).order('date', { ascending: false }),
      supabase.from('alerts').select('severity, domain, message').gte('created_at', weekStart + 'T00:00:00Z').lte('created_at', weekEnd + 'T23:59:59Z'),
      supabase.from('goals').select('*').eq('status', 'active'),
      supabase.from('ministry_log').select('*').gte('date', weekStart).lte('date', weekEnd),
      supabase.from('life_reviews').select('summary, overall_grade, domain_scores').order('week_start', { ascending: false }).limit(1).maybeSingle(),
    ]);

  const checkins = checkinsRes.data || [];
  const streaks = streaksRes.data || [];
  const budgetStatus = budgetRes.data || [];
  const transactions = txnsRes.data || [];
  const alerts = alertsRes.data || [];
  const goals = goalsRes.data || [];
  const ministryEntries = ministryRes.data || [];
  const prevReview = prevReviewRes.data;

  // Compute aggregates
  const totalSpent = transactions.reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.amount), 0);
  const bibleDays = checkins.filter((c: Record<string, unknown>) => c.bible_reading).length;
  const gymDays = checkins.filter((c: Record<string, unknown>) => c.gym_completed).length;
  const packedLunchDays = checkins.filter((c: Record<string, unknown>) => c.packed_lunch).length;
  const phoneAwayDays = checkins.filter((c: Record<string, unknown>) => c.phone_away_by_930).length;
  const codingMinutes = checkins.reduce((sum: number, c: Record<string, unknown>) => sum + (Number(c.coding_minutes) || 0), 0);
  const ministryHours = ministryEntries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.hours), 0);

  const userMessage = `
WEEK: ${weekStart} to ${weekEnd}
CHECK-INS SUBMITTED: ${checkins.length} / 7

SPIRITUAL:
  Bible reading: ${bibleDays} / 7 days
  Ministry hours: ${ministryHours}
  Current Bible streak: ${streaks.find((s: Record<string, unknown>) => s.habit === 'bible_reading')?.current_streak || 0} days

HEALTH:
  Gym sessions: ${gymDays} (target: 3)
  Current gym streak: ${streaks.find((s: Record<string, unknown>) => s.habit === 'gym')?.current_streak || 0} days

FINANCIAL:
  Total spent this week: $${totalSpent.toFixed(2)}
  Weekly target: $625
${budgetStatus.map((b: Record<string, unknown>) => `  ${b.category}: $${b.spent_this_month} / $${b.monthly_limit} (${b.pct_used}%)${b.is_frozen ? ' [FROZEN]' : ''}`).join('\n')}

SLEEP:
  Phone away by 9:30: ${phoneAwayDays} / 7 days
  Current streak: ${streaks.find((s: Record<string, unknown>) => s.habit === 'phone_away_930')?.current_streak || 0} days

MEALS:
  Packed lunch: ${packedLunchDays} / ${checkins.length} days
  Meals eaten out this week: ${checkins.reduce((sum: number, c: Record<string, unknown>) => sum + (Number(c.meals_eaten_out) || 0), 0)}

CAREER:
  Coding: ${codingMinutes} minutes (${(codingMinutes / 60).toFixed(1)} hours, target: 6 hours)
  Current streak: ${streaks.find((s: Record<string, unknown>) => s.habit === 'coding')?.current_streak || 0} days

GOALS:
${goals.map((g: Record<string, unknown>) => `  ${g.title}: ${g.current_value}/${g.target_value} ${g.unit}`).join('\n')}

ALERTS THIS WEEK: ${alerts.length}
${alerts.slice(0, 5).map((a: Record<string, unknown>) => `  [${a.domain}/${a.severity}] ${a.message}`).join('\n')}

${prevReview ? `LAST WEEK'S GRADE: ${prevReview.overall_grade}\nLAST WEEK'S SUMMARY: ${prevReview.summary?.slice(0, 200)}...` : 'NO PREVIOUS REVIEW'}

Generate the weekly life review as JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: LIFE_REVIEW_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result: LifeReviewResult = JSON.parse(cleaned);

    // Store in database
    await supabase.from('life_reviews').insert({
      week_start: weekStart,
      week_end: weekEnd,
      stats: {
        spiritual: { bible_days: bibleDays, ministry_hours: ministryHours },
        health: { gym_sessions: gymDays },
        financial: { total_spent: totalSpent },
        sleep: { phone_away_days: phoneAwayDays },
        meals: { packed_lunches: packedLunchDays },
        career: { coding_minutes: codingMinutes },
      },
      summary: result.summary,
      domain_scores: result.domain_scores,
      wins: result.wins,
      struggles: result.struggles,
      suggestion: result.suggestion,
      overall_grade: result.overall_grade,
    });

    return result;
  } catch (err) {
    console.error('Failed to parse life review:', text);
    const fallback: LifeReviewResult = {
      summary: `Week of ${weekStart}: ${checkins.length} check-ins submitted. Review generation failed.`,
      total_checkins: checkins.length,
      wins: [],
      struggles: [],
      suggestion: 'Try again next week.',
      overall_grade: 'N/A',
      domain_scores: {},
    };
    await supabase.from('life_reviews').insert({
      week_start: weekStart,
      week_end: weekEnd,
      stats: {},
      summary: fallback.summary,
      overall_grade: fallback.overall_grade,
    });
    return fallback;
  }
}
