'use client';

import { useState } from 'react';
import PlaidLinkButton from '@/components/PlaidLink';
import BottomNav from '@/components/BottomNav';

export default function SetupPage() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-accent">Setup</h1>
        <p className="text-sm text-text-muted mt-1">Connect your bank account to get started</p>
      </header>

      <main className="px-4 space-y-6">
        {connected ? (
          <div className="rounded-xl bg-success/10 border border-success/20 p-6 text-center">
            <p className="text-success text-lg font-semibold">Bank Connected!</p>
            <p className="text-text-muted text-sm mt-2">
              Your transactions will sync automatically. Head to the Dashboard to see your spending.
            </p>
            <a
              href="/"
              className="inline-block mt-4 rounded-lg bg-accent px-6 py-2 text-sm font-medium text-background"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-surface border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">How it works</h2>
              <ol className="space-y-3 text-sm text-text-muted">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">1</span>
                  <span>Connect your bank account securely through Plaid</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">2</span>
                  <span>PocketWatch monitors your transactions in real-time</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">3</span>
                  <span>Get smart alerts when spending needs attention</span>
                </li>
              </ol>
            </div>

            <PlaidLinkButton onSuccess={() => setConnected(true)} />

            <p className="text-xs text-text-muted text-center">
              Your bank credentials are handled securely by Plaid and never touch our servers.
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
