'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MinistryLog } from '@/lib/supabase/types';

export function useMinistryLog() {
  const [entries, setEntries] = useState<MinistryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('ministry_log')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);
    setEntries((data as MinistryLog[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function addEntry(entry: { date: string; hours: number; type?: string; notes?: string }) {
    const supabase = createClient();
    const { data } = await supabase.from('ministry_log').insert(entry).select().single();
    if (data) {
      setEntries((prev) => [data as MinistryLog, ...prev]);
    }
    return !!data;
  }

  // Get total hours for current month
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthlyHours = entries
    .filter((e) => e.date >= monthStart.toISOString().split('T')[0])
    .reduce((sum, e) => sum + Number(e.hours), 0);

  return { entries, loading, addEntry, monthlyHours, refetch: fetchEntries };
}
