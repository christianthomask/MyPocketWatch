import { NextRequest, NextResponse } from 'next/server';
import { analyzeCheckinContext } from '@/lib/anthropic/analyze-checkin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await analyzeCheckinContext();
    return NextResponse.json({
      alert_sent: result.alert_needed,
      domain: result.domain,
      severity: result.severity,
      trigger: result.trigger,
    });
  } catch (error) {
    console.error('Contextual check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
