'use client';

import { useState, useEffect } from 'react';
import PlaidLinkButton from '@/components/PlaidLink';
import BottomNav from '@/components/BottomNav';
import { createClient } from '@/lib/supabase/client';

export default function SetupPage() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<{
    institution_name: string;
    last_synced_at: string | null;
  } | null>(null);
  const [txnCount, setTxnCount] = useState(0);

  // Check if already connected
  useEffect(() => {
    async function checkConnection() {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('plaid_connections')
        .select('institution_name, last_synced_at')
        .limit(1)
        .maybeSingle();

      if (conn) {
        setConnected(true);
        setConnectionInfo(conn as { institution_name: string; last_synced_at: string | null });
      }

      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      setTxnCount(count || 0);
    }
    checkConnection();
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/plaid/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.message);
        // Refresh txn count
        const supabase = createClient();
        const { count } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
        setTxnCount(count || 0);
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch {
      setSyncResult('Sync failed — check console for details');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-accent">Setup</h1>
        <p className="text-sm text-text-muted mt-1">
          {connected ? 'Manage your bank connection' : 'Connect your bank account to get started'}
        </p>
      </header>

      <main className="px-4 space-y-6">
        {connected ? (
          <>
            {/* Connection Status */}
            <div className="rounded-xl bg-success/10 border border-success/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success text-lg">🏦</span>
                </div>
                <div>
                  <p className="text-success font-semibold">
                    {connectionInfo?.institution_name || 'Bank Connected'}
                  </p>
                  <p className="text-text-muted text-xs">
                    {connectionInfo?.last_synced_at
                      ? `Last synced: ${new Date(connectionInfo.last_synced_at).toLocaleString()}`
                      : 'Not yet synced'}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="rounded-xl bg-surface border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-2xl font-bold">{txnCount}</p>
                </div>
                <a href="/" className="text-xs text-accent">View dashboard →</a>
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Transactions Now'}
            </button>

            {syncResult && (
              <div className={`rounded-lg p-3 text-sm text-center ${
                syncResult.startsWith('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
              }`}>
                {syncResult}
              </div>
            )}

            {/* Reconnect Option */}
            <div className="rounded-xl bg-surface border border-border p-4">
              <p className="text-sm font-medium mb-2">Connect a different bank</p>
              <PlaidLinkButton onSuccess={() => window.location.reload()} />
            </div>
          </>
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
