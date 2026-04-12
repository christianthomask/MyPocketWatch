import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const HABIT_FIELD_MAP: Record<string, string> = {
  bible_reading: 'bible_reading',
  gym: 'gym_completed',
  packed_lunch: 'packed_lunch',
  bed_by_1030: 'phone_away_by_930', // proxy: if phone away by 9:30, likely in bed by 10:30
  no_eating_out: 'meals_eaten_out', // inverted: 0 eaten out = streak continues
  phone_away_930: 'phone_away_by_930',
  coding: 'coding_minutes',
};

function isHabitCompleted(
  habit: string,
  checkin: Record<string, unknown>
): boolean {
  switch (habit) {
    case 'bible_reading':
      return !!checkin.bible_reading;
    case 'gym':
      return !!checkin.gym_completed;
    case 'packed_lunch':
      return !!checkin.packed_lunch;
    case 'bed_by_1030':
      return !!checkin.phone_away_by_930;
    case 'no_eating_out':
      return ((checkin.meals_eaten_out as number) || 0) === 0;
    case 'phone_away_930':
      return !!checkin.phone_away_by_930;
    case 'coding':
      return ((checkin.coding_minutes as number) || 0) > 0;
    default:
      return false;
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    const [checkinRes, streaksRes] = await Promise.all([
      supabase.from('daily_checkins').select('*').eq('date', today).maybeSingle(),
      supabase.from('streaks').select('*').order('habit'),
    ]);

    return NextResponse.json({
      checkin: checkinRes.data || null,
      streaks: streaksRes.data || [],
    });
  } catch (error) {
    console.error('Check-in GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Upsert today's check-in
    const { data: checkin, error: upsertError } = await supabase
      .from('daily_checkins')
      .upsert(
        { ...body, date: today, updated_at: new Date().toISOString() },
        { onConflict: 'date' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Check-in upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      );
    }

    // Update streaks for each habit
    const { data: streaks } = await supabase.from('streaks').select('*');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const streak of streaks || []) {
      const completed = isHabitCompleted(streak.habit, checkin);

      if (completed) {
        const isConsecutive = streak.last_completed === yesterdayStr;
        const newStreak = isConsecutive
          ? (streak.current_streak || 0) + 1
          : 1;
        const newLongest = Math.max(newStreak, streak.longest_streak || 0);

        await supabase
          .from('streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_completed: today,
            total_completions:
              (streak.total_completions || 0) +
              (streak.last_completed === today ? 0 : 1),
            updated_at: new Date().toISOString(),
          })
          .eq('id', streak.id);
      } else if (
        streak.last_completed !== today &&
        streak.last_completed !== yesterdayStr
      ) {
        // Streak broken — only reset if not already updated today
        if (streak.current_streak > 0) {
          await supabase
            .from('streaks')
            .update({
              current_streak: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', streak.id);
        }
      }
    }

    // Fetch updated streaks
    const { data: updatedStreaks } = await supabase
      .from('streaks')
      .select('*')
      .order('habit');

    return NextResponse.json({ checkin, streaks: updatedStreaks || [] });
  } catch (error) {
    console.error('Check-in POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save check-in' },
      { status: 500 }
    );
  }
}
