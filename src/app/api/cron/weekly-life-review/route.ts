import { NextRequest, NextResponse } from 'next/server';
import { generateLifeReview } from '@/lib/anthropic/life-review';
import { sendPushToAll } from '@/lib/push/send-notification';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - now.getDay()); // Last Sunday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const result = await generateLifeReview(weekStartStr, weekEndStr);

    await sendPushToAll({
      title: '📊 Weekly Life Review',
      body: `Grade: ${result.overall_grade}. ${result.wins.length} wins this week.`,
      severity: 'info',
      url: '/reports',
    });

    return NextResponse.json({
      success: true,
      grade: result.overall_grade,
      wins: result.wins.length,
    });
  } catch (error) {
    console.error('Life review error:', error);
    return NextResponse.json({ error: 'Review generation failed' }, { status: 500 });
  }
}
