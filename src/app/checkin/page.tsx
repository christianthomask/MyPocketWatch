'use client';

import { useState, useEffect } from 'react';
import { useCheckin } from '@/hooks/useCheckin';
import HabitToggle from '@/components/HabitToggle';
import MoodRating from '@/components/MoodRating';
import BottomNav from '@/components/BottomNav';

export default function CheckinPage() {
  const { checkin, streaks, loading, saving, submitCheckin } = useCheckin();
  const [saved, setSaved] = useState(false);

  // Local form state
  const [form, setForm] = useState({
    bible_reading: false,
    bible_reading_notes: '',
    gym_completed: false,
    gym_workout: '',
    packed_lunch: false,
    meals_cooked: 0,
    meals_eaten_out: 0,
    phone_away_by_930: false,
    coding_minutes: 0,
    coding_project: '',
    ministry_hours: 0,
    mood: null as number | null,
    daily_win: '',
  });

  // Pre-fill from existing check-in
  useEffect(() => {
    if (checkin) {
      setForm({
        bible_reading: checkin.bible_reading || false,
        bible_reading_notes: checkin.bible_reading_notes || '',
        gym_completed: checkin.gym_completed || false,
        gym_workout: checkin.gym_workout || '',
        packed_lunch: checkin.packed_lunch || false,
        meals_cooked: checkin.meals_cooked || 0,
        meals_eaten_out: checkin.meals_eaten_out || 0,
        phone_away_by_930: checkin.phone_away_by_930 || false,
        coding_minutes: checkin.coding_minutes || 0,
        coding_project: checkin.coding_project || '',
        ministry_hours: Number(checkin.ministry_hours) || 0,
        mood: checkin.mood || null,
        daily_win: checkin.daily_win || '',
      });
    }
  }, [checkin]);

  function getStreak(habit: string): number {
    return streaks.find((s) => s.habit === habit)?.current_streak || 0;
  }

  async function handleSave() {
    const success = await submitCheckin(form);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <header className="px-4 pt-12 pb-4">
          <div className="h-8 w-40 bg-surface rounded animate-pulse" />
        </header>
        <main className="px-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Daily Check-In</h1>
        <p className="text-sm text-text-muted mt-1">{today}</p>
      </header>

      <main className="px-4 space-y-3">
        {/* Bible Reading */}
        <HabitToggle
          icon="📖"
          label="Bible reading today"
          checked={form.bible_reading}
          streak={getStreak('bible_reading')}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
          onChange={(v) => setForm((f) => ({ ...f, bible_reading: v }))}
        >
          <input
            type="text"
            placeholder="What did you read?"
            value={form.bible_reading_notes}
            onChange={(e) => setForm((f) => ({ ...f, bible_reading_notes: e.target.value }))}
            className="w-full mt-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </HabitToggle>

        {/* Gym */}
        <HabitToggle
          icon="💪"
          label="Gym today"
          checked={form.gym_completed}
          streak={getStreak('gym')}
          color="text-green-400"
          bgColor="bg-green-400/10"
          onChange={(v) => setForm((f) => ({ ...f, gym_completed: v }))}
        >
          <div className="flex gap-2 mt-2">
            {['Push', 'Pull', 'Legs'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setForm((f) => ({ ...f, gym_workout: w.toLowerCase() }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  form.gym_workout === w.toLowerCase()
                    ? 'bg-green-400/20 text-green-400 ring-1 ring-green-400/30'
                    : 'bg-surface-elevated text-text-muted'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </HabitToggle>

        {/* Packed Lunch */}
        <HabitToggle
          icon="🍱"
          label="Packed lunch"
          checked={form.packed_lunch}
          streak={getStreak('packed_lunch')}
          color="text-orange-400"
          bgColor="bg-orange-400/10"
          onChange={(v) => setForm((f) => ({ ...f, packed_lunch: v }))}
        />

        {/* Meals */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-sm font-medium mb-3">🍳 Meals</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-text-muted">Cooked</label>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, meals_cooked: n }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      form.meals_cooked === n
                        ? 'bg-success/20 text-success ring-1 ring-success/30'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-muted">Eaten out</label>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, meals_eaten_out: n }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      form.meals_eaten_out === n
                        ? (n === 0 ? 'bg-success/20 text-success ring-1 ring-success/30' : 'bg-warning/20 text-warning ring-1 ring-warning/30')
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <HabitToggle
          icon="🌙"
          label="Phone away by 9:30"
          checked={form.phone_away_by_930}
          streak={getStreak('phone_away_930')}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
          onChange={(v) => setForm((f) => ({ ...f, phone_away_by_930: v }))}
        />

        {/* Coding */}
        <HabitToggle
          icon="💻"
          label="Coding / learning"
          checked={form.coding_minutes > 0}
          streak={getStreak('coding')}
          color="text-yellow-400"
          bgColor="bg-yellow-400/10"
          onChange={(v) => setForm((f) => ({ ...f, coding_minutes: v ? (f.coding_minutes || 30) : 0 }))}
        >
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-muted w-16">Minutes</label>
              <input
                type="number"
                value={form.coding_minutes}
                onChange={(e) => setForm((f) => ({ ...f, coding_minutes: parseInt(e.target.value) || 0 }))}
                className="w-20 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <input
              type="text"
              placeholder="What project?"
              value={form.coding_project}
              onChange={(e) => setForm((f) => ({ ...f, coding_project: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </HabitToggle>

        {/* Mood */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-sm font-medium mb-3">How are you feeling?</p>
          <MoodRating
            value={form.mood}
            onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
          />
        </div>

        {/* Daily Win */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <label className="text-sm font-medium">🏆 Today&#39;s win</label>
          <input
            type="text"
            placeholder="One good thing today..."
            value={form.daily_win}
            onChange={(e) => setForm((f) => ({ ...f, daily_win: e.target.value }))}
            className="w-full mt-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all ${
            saved
              ? 'bg-success text-background'
              : 'bg-accent text-background hover:opacity-90'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : checkin ? 'Update Check-In' : 'Save Check-In'}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
