import webPush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured — push notifications disabled');
    return;
  }
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:christian@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  vapidConfigured = true;
}

interface NotificationPayload {
  title: string;
  body: string;
  severity: string;
  url?: string;
}

export async function sendPushToAll(payload: NotificationPayload): Promise<number> {
  ensureVapidConfigured();
  if (!vapidConfigured) return 0;

  const supabase = createAdminClient();
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('active', true);

  if (!subscriptions || subscriptions.length === 0) return 0;

  let delivered = 0;
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        },
        JSON.stringify(payload)
      );
      delivered++;
    } catch (err: unknown) {
      const error = err as { statusCode?: number };
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription expired — clean up
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      }
      console.error('Push failed for subscription:', sub.id, err);
    }
  }
  return delivered;
}
