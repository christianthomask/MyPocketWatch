'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MealPlan } from '@/lib/supabase/types';
import BottomNav from '@/components/BottomNav';

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  am_snack: '🥤',
  lunch: '🍱',
  pm_snack: '🥜',
  dinner: '🍽',
  evening: '🌙',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  am_snack: 'AM Snack',
  lunch: 'Lunch',
  pm_snack: 'PM Snack',
  dinner: 'Dinner',
  evening: 'Evening',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MealsPage() {
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<'a' | 'b'>('a');
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay());

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('week', week)
        .order('sort_order');
      setMeals((data as MealPlan[]) || []);
      setLoading(false);
    }
    setLoading(true);
    fetch();
  }, [week]);

  // Get today's meals: template meals (day_of_week=0) for non-dinner, specific dinner for selected day
  const todayMeals = meals.filter((m) => {
    if (m.meal_type === 'dinner') return m.day_of_week === dayOfWeek;
    return m.day_of_week === 0; // Template meals
  }).sort((a, b) => a.sort_order - b.sort_order);

  const totalCal = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein_g || 0), 0);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Meal Plan</h1>
      </header>

      {/* Week Toggle */}
      <div className="px-4 mb-3">
        <div className="flex bg-surface rounded-lg p-1 border border-border">
          {(['a', 'b'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                week === w ? 'bg-accent text-background' : 'text-text-muted'
              }`}
            >
              Week {w.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-4 mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {DAY_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => setDayOfWeek(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              dayOfWeek === i
                ? 'bg-accent text-background'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <main className="px-4 space-y-4">
        {/* Macro Summary */}
        <div className="rounded-xl bg-surface border border-border p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Daily Target</p>
            <p className="text-xs text-text-muted">2200 cal / 190g protein</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">{totalCal}</span>
                <span className="text-xs text-text-muted">cal</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-elevated mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${totalCal > 2200 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min((totalCal / 2200) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">{totalProtein}</span>
                <span className="text-xs text-text-muted">g protein</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-elevated mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${totalProtein >= 190 ? 'bg-success' : 'bg-accent'}`}
                  style={{ width: `${Math.min((totalProtein / 190) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meals List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="rounded-lg bg-surface border border-border p-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{MEAL_ICONS[meal.meal_type] || '🍴'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-text-muted">
                        {MEAL_LABELS[meal.meal_type] || meal.meal_type}
                        {meal.is_prepped && <span className="ml-1 text-success">prepped</span>}
                      </p>
                      <div className="flex gap-2 text-xs text-text-muted">
                        {meal.calories && <span>{meal.calories}c</span>}
                        {meal.protein_g && <span>{meal.protein_g}gP</span>}
                      </div>
                    </div>
                    <p className="text-sm mt-0.5">{meal.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
