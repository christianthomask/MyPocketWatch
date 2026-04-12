'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DailyCheckin, Streak } from '@/lib/supabase/types';

interface CheckinState {
  checkin: DailyCheckin | null;
  streaks: Streak[];
  loading: boolean;
  saving: boolean;
}

export function useCheckin() {
  const [state, setState] = useState<CheckinState>({
    checkin: null,
    streaks: [],
    loading: true,
    saving: false,
  });

  const fetchCheckin = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin');
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        checkin: data.checkin,
        streaks: data.streaks,
        loading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchCheckin();
  }, [fetchCheckin]);

  async function submitCheckin(data: Partial<DailyCheckin>) {
    setState((prev) => ({ ...prev, saving: true }));
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setState((prev) => ({
        ...prev,
        checkin: result.checkin,
        streaks: result.streaks,
        saving: false,
      }));
      return true;
    } catch {
      setState((prev) => ({ ...prev, saving: false }));
      return false;
    }
  }

  return {
    checkin: state.checkin,
    streaks: state.streaks,
    loading: state.loading,
    saving: state.saving,
    submitCheckin,
    refetch: fetchCheckin,
  };
}
