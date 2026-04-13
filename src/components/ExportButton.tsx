'use client';

import { useState } from 'react';

export default function ExportButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  async function handleExport() {
    setStatus('loading');
    try {
      const res = await fetch('/api/export/checkin');
      const data = await res.json();
      if (data.report) {
        await navigator.clipboard.writeText(data.report);
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    } catch {
      // Fallback: try share sheet if clipboard fails
      try {
        const res = await fetch('/api/export/checkin');
        const data = await res.json();
        if (data.report && navigator.share) {
          await navigator.share({ title: 'PocketWatch+ Check-In', text: data.report });
          setStatus('idle');
        } else {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 2500);
        }
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`w-full rounded-xl border p-3 text-sm font-medium transition-all ${
        status === 'copied'
          ? 'bg-success/10 border-success/30 text-success'
          : status === 'error'
          ? 'bg-danger/10 border-danger/30 text-danger'
          : 'bg-surface border-border text-text-muted hover:border-accent/30 hover:text-accent'
      }`}
    >
      {status === 'loading' ? 'Generating report...' :
       status === 'copied' ? '✓ Copied! Paste into Claude' :
       status === 'error' ? 'Export failed — try again' :
       '📋 Export Check-In for Claude'}
    </button>
  );
}
