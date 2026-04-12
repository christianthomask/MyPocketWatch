'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  onSuccess?: () => void;
}

export default function PlaidLinkButton({ onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createLinkToken() {
      try {
        const res = await fetch('/api/plaid/create-link-token', { method: 'POST' });
        const data = await res.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
        } else {
          setError('Failed to initialize bank connection');
        }
      } catch {
        setError('Failed to initialize bank connection');
      }
    }
    createLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: { institution?: { name?: string; institution_id?: string } | null }) => {
      setLoading(true);
      try {
        const res = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token: publicToken,
            institution: metadata.institution,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess?.();
        } else {
          setError('Failed to connect bank account');
        }
      } catch {
        setError('Failed to connect bank account');
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  if (error) {
    return (
      <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 text-center">
        <p className="text-danger text-sm">{error}</p>
        <button
          onClick={() => { setError(null); window.location.reload(); }}
          className="mt-2 text-xs text-accent underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Connecting...' : !ready ? 'Loading...' : 'Connect Your Bank'}
    </button>
  );
}
