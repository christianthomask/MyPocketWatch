import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_CATEGORY = 'Other';

/**
 * Match a merchant name against the merchant_categories table using ILIKE patterns.
 * Returns the matched category or 'Other' if no match found.
 */
export async function categorizeByMerchant(
  merchantName: string,
  supabase: SupabaseClient
): Promise<string> {
  if (!merchantName) return DEFAULT_CATEGORY;

  const firstWord = merchantName.split(' ')[0];
  const { data } = await supabase
    .from('merchant_categories')
    .select('category')
    .ilike('merchant_pattern', `%${firstWord}%`)
    .limit(1)
    .maybeSingle();

  return (data as { category: string } | null)?.category ?? DEFAULT_CATEGORY;
}

/**
 * Save a new merchant -> category mapping (learned from AI analysis).
 */
export async function saveMerchantMapping(
  merchantName: string,
  category: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase.from('merchant_categories').upsert(
    {
      merchant_pattern: merchantName + '%',
      category,
    },
    { onConflict: 'merchant_pattern' }
  );
}

/**
 * Check if a category is frozen (spending should trigger a warning).
 */
export function isFrozenCategory(category: string, budgets: { category: string; is_frozen: boolean }[]): boolean {
  return budgets.some((b) => b.category === category && b.is_frozen);
}

/**
 * Check if a category is essential (should never trigger alerts for normal spending).
 */
export function isEssentialCategory(category: string, budgets: { category: string; is_essential: boolean }[]): boolean {
  return budgets.some((b) => b.category === category && b.is_essential);
}
