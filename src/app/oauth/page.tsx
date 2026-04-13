'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from 'react-plaid-link';
import { useRouter } from 'next/navigation';

export default function OAuthRedirectPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'linking' | 'success' | 'error'>('loading');
  const router = useRouter();

  useEffect(() => {
    // On OAuth return, the link token is stored in localStorage by Plaid
    const storedToken = localStorage.getItem('plaid_link_token');
    if (storedToken) {
      setLinkToken(storedToken);
    } else {
      setStatus('error');
    }
  }, []);

  const onSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
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
          setStatus('success');
          localStorage.removeItem('plaid_link_token');
          setTimeout(() => router.push('/'), 1500);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    },
    [router]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    receivedRedirectUri: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  useEffect(() => {
    if (ready) {
      setStatus('linking');
      open();
    }
  }, [ready, open]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-xl bg-surface border border-border p-6 text-center max-w-sm">
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Completing bank connection...</p>
          </>
        )}
        {status === 'linking' && (
          <>
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Finishing authentication...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <p className="text-success text-lg font-semibold">Bank Connected!</p>
            <p className="text-text-muted text-sm mt-2">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-danger text-lg font-semibold">Connection Failed</p>
            <p className="text-text-muted text-sm mt-2">Please try again from the Setup page.</p>
            <a
              href="/setup"
              className="inline-block mt-4 rounded-lg bg-accent px-6 py-2 text-sm font-medium text-background"
            >
              Back to Setup
            </a>
          </>
        )}
      </div>
    </div>
  );
}
