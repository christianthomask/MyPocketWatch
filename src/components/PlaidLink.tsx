'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccessMetadata, PlaidLinkOnExitMetadata, PlaidLinkError } from 'react-plaid-link';

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
          // Store for OAuth redirect flow
          localStorage.setItem('plaid_link_token', data.link_token);
        } else {
          console.error('Link token response:', data);
          setError('Failed to initialize bank connection');
        }
      } catch (err) {
        console.error('Link token fetch error:', err);
        setError('Failed to initialize bank connection');
      }
    }
    createLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
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
          console.error('Exchange token response:', data);
          setError('Failed to connect bank account');
        }
      } catch (err) {
        console.error('Exchange token error:', err);
        setError('Failed to connect bank account');
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const onPlaidExit = useCallback(
    (err: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        console.error('Plaid Link exit metadata:', metadata);
        // Show user-friendly error for common cases
        if (err.error_code === 'INVALID_LINK_TOKEN') {
          setError('Session expired. Please refresh and try again.');
        } else if (err.error_message) {
          setError(`Bank connection error: ${err.error_message}`);
        } else {
          setError('Bank connection was interrupted. Please try again.');
        }
      }
      // If err is null, user just closed the modal — no error to show
    },
    []
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
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
