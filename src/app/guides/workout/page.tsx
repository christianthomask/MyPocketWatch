'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { WorkoutDay, Exercise, DailyProtocol, Json } from '@/lib/supabase/types';
import BottomNav from '@/components/BottomNav';

const DAY_TO_WORKOUT: Record<number, string> = {
  1: 'push', // Monday
  3: 'pull', // Wednesday
  5: 'legs', // Friday
};

export default function WorkoutPage() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [protocols, setProtocols] = useState<DailyProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>(
    DAY_TO_WORKOUT[new Date().getDay()] || 'push'
  );
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const [daysRes, exRes, protRes] = await Promise.all([
        supabase.from('workout_days').select('*').order('sort_order'),
        supabase.from('exercises').select('*').order('sort_order'),
        supabase.from('daily_protocols').select('*').order('sort_order'),
      ]);
      setWorkoutDays((daysRes.data as WorkoutDay[]) || []);
      setExercises((exRes.data as Exercise[]) || []);
      setProtocols((protRes.data as DailyProtocol[]) || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const currentWorkoutDay = workoutDays.find((d) => d.day_name === selectedDay);
  const currentExercises = exercises.filter(
    (e) => currentWorkoutDay && e.workout_day_id === currentWorkoutDay.id
  );

  const isGymDay = !!DAY_TO_WORKOUT[new Date().getDay()];
  const todayWorkout = DAY_TO_WORKOUT[new Date().getDay()];

  function toggleCheck(id: string) {
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
        <h1 className="text-2xl font-bold">Workout</h1>
        <p className="text-sm text-text-muted mt-1">
          {isGymDay
            ? `Today: ${todayWorkout?.charAt(0).toUpperCase()}${todayWorkout?.slice(1)} Day`
            : 'Rest day — do your back protocol'}
        </p>
      </header>

      {/* Day Selector */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface rounded-lg p-1 border border-border">
          {workoutDays.map((wd) => (
            <button
              key={wd.day_name}
              onClick={() => { setSelectedDay(wd.day_name); setChecked(new Set()); }}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                selectedDay === wd.day_name ? 'bg-accent text-background' : 'text-text-muted'
              }`}
            >
              {wd.day_label.replace(/Day [A-C]: /, '')}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 space-y-4">
        {/* Daily Protocols */}
        {protocols.map((protocol) => (
          <div key={protocol.id} className="rounded-xl bg-surface border border-border p-4">
            <h3 className="text-sm font-semibold mb-2">{protocol.label}</h3>
            <div className="space-y-1.5">
              {(protocol.exercises as { name: string; reps: string }[]).map((ex, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{ex.name}</span>
                  <span className="text-xs font-mono text-text-muted">{ex.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Exercises */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold mb-2">
              {currentWorkoutDay?.day_label || 'Exercises'}
            </h2>
            <div className="space-y-1.5">
              {currentExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => toggleCheck(ex.id)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    checked.has(ex.id) ? 'bg-success/10' : 'bg-surface border border-border'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      checked.has(ex.id) ? 'bg-success border-success' : 'border-border'
                    }`}
                  >
                    {checked.has(ex.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${checked.has(ex.id) ? 'line-through opacity-60' : ''}`}>
                      {ex.name}
                    </p>
                    {ex.note && <p className="text-xs text-text-muted">{ex.note}</p>}
                  </div>
                  <span className="text-xs font-mono text-accent">{ex.sets_reps}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {currentExercises.length > 0 && (
          <div className="rounded-lg bg-surface border border-border p-3 text-center">
            <p className="text-sm text-text-muted">
              {checked.size} / {currentExercises.length} exercises done
            </p>
            <div className="h-1.5 rounded-full bg-surface-elevated mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${(checked.size / currentExercises.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
