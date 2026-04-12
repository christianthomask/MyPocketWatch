'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LifeReview } from '@/lib/supabase/types';

export function useLifeReviews() {
  const [reviews, setReviews] = useState<LifeReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();
      const { data } = await supabase
        .from('life_reviews')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(10);
      setReviews((data as LifeReview[]) || []);
      setLoading(false);
    }
    fetchReviews();
  }, []);

  return { reviews, loading };
}
