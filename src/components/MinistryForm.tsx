'use client';

import { useState } from 'react';

interface MinistryFormProps {
  onSubmit: (data: { date: string; hours: number; type: string; notes: string }) => void;
  saving?: boolean;
}

export default function MinistryForm({ onSubmit, saving }: MinistryFormProps) {
  const [hours, setHours] = useState(1);
  const [type, setType] = useState('field');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handleSubmit() {
    onSubmit({ date: today, hours, type, notes });
    setNotes('');
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center gap-3">
        <label className="text-xs text-text-muted w-14">Hours</label>
        <div className="flex gap-1">
          {[0.5, 1, 1.5, 2, 3, 4].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHours(h)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                hours === h
                  ? 'bg-purple-400/20 text-purple-400 ring-1 ring-purple-400/30'
                  : 'bg-surface-elevated text-text-muted'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-text-muted w-14">Type</label>
        <div className="flex gap-1">
          {['field', 'informal', 'study', 'letter'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                type === t
                  ? 'bg-purple-400/20 text-purple-400 ring-1 ring-purple-400/30'
                  : 'bg-surface-elevated text-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-lg bg-purple-400/20 text-purple-400 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {saving ? 'Logging...' : 'Log Ministry Hours'}
      </button>
    </div>
  );
}
