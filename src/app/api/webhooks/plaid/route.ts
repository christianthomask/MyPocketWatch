import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncTransactions } from '@/lib/plaid/sync';
import { categorizeByMerchant } from '@/lib/categories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Only handle transaction sync events
    if (
      body.webhook_type !== 'TRANSACTIONS' ||
      body.webhook_code !== 'SYNC_UPDATES_AVAILABLE'
    ) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // 1. Get Plaid access token and cursor from DB
    const { data: connection } = await supabase
      .from('plaid_connections')
      .select('access_token, cursor')
      .eq('item_id', body.item_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Unknown item' }, { status: 404 });
    }

    // 2. Sync new transactions from Plaid
    const { added, cursor: newCursor } = await syncTransactions(
      connection.access_token as string,
      connection.cursor as string | null
    );

    // 3. Update cursor
    await supabase
      .from('plaid_connections')
      .update({ cursor: newCursor, last_synced_at: new Date().toISOString() })
      .eq('item_id', body.item_id);

    // 4. Categorize and store each transaction
    for (const txn of added) {
      const merchantName = txn.merchant_name || txn.name || 'Unknown';
      const category = await categorizeByMerchant(merchantName, supabase);

      await supabase
        .from('transactions')
        .upsert(
          {
            plaid_transaction_id: txn.transaction_id,
            date: txn.date,
            merchant_name: merchantName,
            amount: Math.abs(txn.amount), // Plaid uses negative for debits
            category,
            plaid_categories: txn.personal_finance_category
              ? [txn.personal_finance_category.primary]
              : [],
            plaid_merchant_id: txn.merchant_entity_id || null,
            pending: txn.pending,
          },
          { onConflict: 'plaid_transaction_id' }
        );

      // Skip analysis for pending or income transactions
      // Analysis will be wired in Phase 3
      if (txn.pending || txn.amount < 0) continue;
    }

    return NextResponse.json({ received: true, synced: added.length });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
