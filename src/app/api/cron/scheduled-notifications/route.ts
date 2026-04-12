import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToAll } from '@/lib/push/send-notification';
import { NOTIFICATION_TITLES } from '@/lib/notifications/scheduled-messages';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const dayOfWeek = now.getUTCDay(); // 0=Sunday

    // Find schedules that match current time window (within 15 min)
    const { data: schedules } = await supabase
      .from('notification_schedule')
      .select('*')
      .eq('active', true)
      .eq('cron_hour', currentHour);

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ sent: 0, reason: 'no matching schedules' });
    }

    let sent = 0;
    for (const schedule of schedules) {
      // Check minute is within 15-min window
      if (Math.abs(schedule.cron_minute - currentMinute) > 14) continue;

      // Check day of week
      const daysActive = schedule.days_of_week as number[];
      if (!daysActive.includes(dayOfWeek)) continue;

      // Don't re-send if already sent within the last hour
      if (schedule.last_sent_at) {
        const lastSent = new Date(schedule.last_sent_at);
        if (now.getTime() - lastSent.getTime() < 3600000) continue;
      }

      // Pick message from rotation
      const messages = schedule.messages as string[];
      const messageIndex = (schedule.message_index || 0) % messages.length;
      const message = messages[messageIndex];
      const title = NOTIFICATION_TITLES[schedule.name] || 'PocketWatch+';

      // Send push
      await sendPushToAll({
        title,
        body: message,
        severity: 'info',
        url: schedule.domain === 'health' ? '/checkin' : '/',
      });

      // Update schedule: increment message index, update last_sent_at
      await supabase
        .from('notification_schedule')
        .update({
          message_index: (messageIndex + 1) % messages.length,
          last_sent_at: now.toISOString(),
        })
        .eq('id', schedule.id);

      sent++;
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('Scheduled notifications error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
