'use client';

import { useEffect, useState } from 'react';

export default function PushPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  if (permission !== 'default' || dismissed) return null;

  async function enablePush() {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        const subJson = subscription.toJSON();
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          }),
        });
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }

  return (
    <div className="rounded-xl bg-accent/10 border border-accent/20 p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Enable Notifications</p>
          <p className="text-xs text-text-muted mt-1">
            Get real-time alerts when spending needs attention
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-text-muted text-xs">
          ✕
        </button>
      </div>
      <button
        onClick={enablePush}
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background"
      >
        Turn on notifications
      </button>
    </div>
  );
}
