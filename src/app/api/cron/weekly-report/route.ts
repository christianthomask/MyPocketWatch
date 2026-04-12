import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport } from '@/lib/anthropic/weekly-report';
import { sendPushToAll } from '@/lib/push/send-notification';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate last week's date range (Sunday to Saturday)
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - now.getDay()); // Last Sunday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6); // Previous Monday

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const report = await generateWeeklyReport(weekStartStr, weekEndStr);

    // Send push notification
    await sendPushToAll({
      title: '📊 Weekly Report',
      body: `You spent $${report.total_spent.toFixed(0)} this week. ${report.on_track ? 'On track!' : 'Over target.'}`,
      severity: 'info',
      url: '/reports',
    });

    return NextResponse.json({
      success: true,
      total_spent: report.total_spent,
      on_track: report.on_track,
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}
