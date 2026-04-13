'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GroceryItem } from '@/lib/supabase/types';
import BottomNav from '@/components/BottomNav';

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein',
  carbs: 'Carbs & Grains',
  produce: 'Produce',
  frozen_canned: 'Frozen & Canned',
  staples: 'Staples',
};

const STORE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'GO First', value: 'GO' },
  { label: "TJ's", value: 'TJ' },
];

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('all');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('is_weekly', true)
        .order('sort_order');
      setItems((data as GroceryItem[]) || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const filteredItems = storeFilter === 'all'
    ? items
    : items.filter((i) => i.store === storeFilter || i.store === 'either');

  const categories = [...new Set(filteredItems.map((i) => i.category))];
  const totalEstimate = filteredItems.reduce((sum, i) => sum + Number(i.estimated_price || 0), 0);
  const checkedTotal = filteredItems
    .filter((i) => checked.has(i.id))
    .reduce((sum, i) => sum + Number(i.estimated_price || 0), 0);

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Grocery List</h1>
      </header>

      {/* Store Filter */}
      <div className="px-4 mb-3 flex gap-2">
        {STORE_FILTERS.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStoreFilter(sf.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              storeFilter === sf.value
                ? 'bg-accent text-background'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 mb-4">
        <div className="rounded-lg bg-surface border border-border p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Estimated Total</p>
            <p className="text-lg font-bold">${totalEstimate.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Checked</p>
            <p className="text-lg font-bold text-success">${checkedTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <main className="px-4 space-y-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="space-y-1">
                {filteredItems
                  .filter((i) => i.category === cat)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                        checked.has(item.id)
                          ? 'bg-success/10 line-through opacity-60'
                          : 'bg-surface'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          checked.has(item.id) ? 'bg-success border-success' : 'border-border'
                        }`}
                      >
                        {checked.has(item.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.name}</p>
                        {item.note && <p className="text-xs text-text-muted">{item.note}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.store && item.store !== 'either' && (
                          <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-surface-elevated">
                            {item.store}
                          </span>
                        )}
                        <span className="text-sm text-text-muted">
                          ${Number(item.estimated_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))
        )}

        {/* Reset */}
        {checked.size > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            className="w-full py-3 text-center text-sm text-text-muted hover:text-foreground transition-colors"
          >
            Reset List
          </button>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
