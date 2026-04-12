'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BudgetStatus } from '@/lib/supabase/types';

export function useBudgetStatus() {
  const [data, setData] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBudgets() {
    const supabase = createClient();
    const { data: budgets } = await supabase
      .from('budget_status')
      .select('*');
    setData((budgets as BudgetStatus[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBudgets();
  }, []);

  return { data, loading, refetch: fetchBudgets };
}
