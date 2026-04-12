import { plaidClient } from './client';
import type { Transaction as PlaidTransaction, RemovedTransaction } from 'plaid';

interface SyncResult {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: RemovedTransaction[];
  cursor: string;
}

/**
 * Incrementally sync transactions from Plaid using the sync cursor.
 * Handles pagination — keeps calling until has_more is false.
 */
export async function syncTransactions(
  accessToken: string,
  cursor?: string | null
): Promise<SyncResult> {
  const added: PlaidTransaction[] = [];
  const modified: PlaidTransaction[] = [];
  const removed: RemovedTransaction[] = [];
  let currentCursor = cursor || undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: currentCursor,
    });

    const data = response.data;
    added.push(...data.added);
    modified.push(...data.modified);
    removed.push(...data.removed);
    currentCursor = data.next_cursor;
    hasMore = data.has_more;
  }

  return {
    added,
    modified,
    removed,
    cursor: currentCursor!,
  };
}
