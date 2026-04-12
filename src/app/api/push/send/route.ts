import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToAll } from '@/lib/push/send-notification';

export async function POST(req: NextRequest) {
  try {
    const { alert_id } = await req.json();
    const supabase = createAdminClient();

    const { data: alert } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alert_id)
      .single();

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const titleMap: Record<string, string> = {
      urgent: '🚨 PocketWatch',
      warning: '⚠️ PocketWatch',
      nudge: '👀 PocketWatch',
      info: '✅ PocketWatch',
    };

    const delivered = await sendPushToAll({
      title: titleMap[alert.severity] || 'PocketWatch',
      body: alert.message,
      severity: alert.severity,
      url: '/alerts',
    });

    await supabase
      .from('alerts')
      .update({ delivered: true, delivery_method: 'push' })
      .eq('id', alert_id);

    return NextResponse.json({ delivered });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
