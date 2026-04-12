import { sendPushToAll } from '@/lib/push/send-notification';
import { sendSMS } from '@/lib/sms/twilio';
import { createAdminClient } from '@/lib/supabase/admin';

export async function dispatchAlert(alertId: string, severity: string, message: string) {
  const supabase = createAdminClient();

  // Fetch domain from the alert
  const { data: alert } = await supabase.from('alerts').select('domain').eq('id', alertId).single();
  const domain = (alert?.domain as string) || 'financial';
  const isFinancial = domain === 'financial';

  const titleMap: Record<string, string> = {
    urgent: '🚨 PocketWatch+',
    warning: '⚠️ PocketWatch+',
    nudge: '👀 PocketWatch+',
    info: '✅ PocketWatch+',
  };

  // Send push notification for all severities except info
  let deliveryMethod = '';
  if (severity !== 'info') {
    await sendPushToAll({
      title: titleMap[severity] || 'PocketWatch+',
      body: message,
      severity,
      url: isFinancial ? '/alerts' : '/checkin',
    });
    deliveryMethod = 'push';
  }

  // SMS fallback for urgent alerts
  if (severity === 'urgent') {
    const smsSent = await sendSMS(message);
    if (smsSent) {
      deliveryMethod = deliveryMethod ? 'both' : 'sms';
    }
  }

  // Update alert delivery status
  if (deliveryMethod) {
    await supabase
      .from('alerts')
      .update({ delivered: true, delivery_method: deliveryMethod })
      .eq('id', alertId);
  }
}
