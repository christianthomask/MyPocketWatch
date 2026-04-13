'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ScheduleBlock } from '@/lib/supabase/types';
import BottomNav from '@/components/BottomNav';

const DAY_TYPES = [
  { value: 'weekday', label: 'Weekday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

function getCurrentDayType(): string {
  const day = new Date().getDay();
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

function isCurrentBlock(time: string, durationMinutes: number | null): boolean {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const blockStart = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const blockEnd = blockStart + (durationMinutes || 60);
  return currentMinutes >= blockStart && currentMinutes < blockEnd;
}

export default function SchedulePage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayType, setDayType] = useState(getCurrentDayType());

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('day_type', dayType)
        .eq('active', true)
        .order('sort_order');
      setBlocks((data as ScheduleBlock[]) || []);
      setLoading(false);
    }
    setLoading(true);
    fetch();
  }, [dayType]);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Daily Schedule</h1>
      </header>

      {/* Day Type Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface rounded-lg p-1 border border-border">
          {DAY_TYPES.map((dt) => (
            <button
              key={dt.value}
              onClick={() => setDayType(dt.value)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                dayType === dt.value ? 'bg-accent text-background' : 'text-text-muted'
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block) => {
              const isCurrent = dayType === getCurrentDayType() && isCurrentBlock(block.time, block.duration_minutes);
              return (
                <div
                  key={block.id}
                  className={`flex gap-3 rounded-lg p-3 transition-colors ${
                    isCurrent ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-surface'
                  }`}
                >
                  <div className="w-14 flex-shrink-0 text-right">
                    <p className={`text-sm font-mono font-medium ${isCurrent ? 'text-accent' : 'text-text-muted'}`}>
                      {block.time}
                    </p>
                    {block.duration_minutes && (
                      <p className="text-[10px] text-text-muted">
                        {block.duration_minutes >= 60
                          ? `${Math.floor(block.duration_minutes / 60)}h${block.duration_minutes % 60 ? block.duration_minutes % 60 + 'm' : ''}`
                          : `${block.duration_minutes}m`}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-0.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: block.color || '#4b5a6f' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-accent' : ''}`}>
                        {block.label}
                      </p>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-background">
                          NOW
                        </span>
                      )}
                    </div>
                    {block.detail && (
                      <p className="text-xs text-text-muted mt-0.5">{block.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
