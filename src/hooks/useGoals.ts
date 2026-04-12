'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Goal } from '@/lib/supabase/types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('status', 'active')
      .order('domain');
    setGoals((data as Goal[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function updateProgress(goalId: string, currentValue: number) {
    const supabase = createClient();
    await supabase.from('goals').update({
      current_value: currentValue,
      updated_at: new Date().toISOString(),
    }).eq('id', goalId);
    setGoals((prev) =>
      prev.map((g) => g.id === goalId ? { ...g, current_value: currentValue } : g)
    );
  }

  return { goals, loading, refetch: fetchGoals, updateProgress };
}
