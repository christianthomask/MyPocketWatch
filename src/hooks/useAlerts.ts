'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Alert } from '@/lib/supabase/types';

export function useAlerts(limit = 20) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    setAlerts((data as Alert[]) || []);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchAlerts();

    // Real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts, limit]);

  async function markAsRead(alertId: string) {
    const supabase = createClient();
    await supabase.from('alerts').update({ acknowledged: true }).eq('id', alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  }

  async function markAllAsRead() {
    const supabase = createClient();
    await supabase.from('alerts').update({ acknowledged: true }).eq('acknowledged', false);
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  }

  return { alerts, loading, refetch: fetchAlerts, markAsRead, markAllAsRead };
}
