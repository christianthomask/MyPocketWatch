'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Streak } from '@/lib/supabase/types';

export function useStreaks() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreaks() {
      const supabase = createClient();
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .order('habit');
      setStreaks((data as Streak[]) || []);
      setLoading(false);
    }
    fetchStreaks();
  }, []);

  function getStreak(habit: string): Streak | undefined {
    return streaks.find((s) => s.habit === habit);
  }

  return { streaks, loading, getStreak };
}
