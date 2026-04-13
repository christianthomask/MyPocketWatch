import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncTransactions } from '@/lib/plaid/sync';
import { categorizeByMerchant } from '@/lib/categories';
import { analyzeTransaction } from '@/lib/anthropic/analyze-transaction';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // Get the first (only) plaid connection
    const { data: connection } = await supabase
      .from('plaid_connections')
      .select('item_id, access_token, cursor')
      .limit(1)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'No bank connected' }, { status: 404 });
    }

    // Sync transactions
    const { added, cursor: newCursor } = await syncTransactions(
      connection.access_token as string,
      connection.cursor as string | null
    );

    // Update cursor
    await supabase
      .from('plaid_connections')
      .update({ cursor: newCursor, last_synced_at: new Date().toISOString() })
      .eq('item_id', connection.item_id);

    // Store and analyze
    let synced = 0;
    let analyzed = 0;
    for (const txn of added) {
      const merchantName = txn.merchant_name || txn.name || 'Unknown';
      const category = await categorizeByMerchant(merchantName, supabase);

      await supabase.from('transactions').upsert(
        {
          plaid_transaction_id: txn.transaction_id,
          date: txn.date,
          merchant_name: merchantName,
          amount: Math.abs(txn.amount),
          category,
          plaid_categories: txn.personal_finance_category
            ? [txn.personal_finance_category.primary]
            : [],
          plaid_merchant_id: txn.merchant_entity_id || null,
          pending: txn.pending,
        },
        { onConflict: 'plaid_transaction_id' }
      );
      synced++;

      // Analyze non-pending, non-income transactions
      if (!txn.pending && txn.amount >= 0) {
        const { data: stored } = await supabase
          .from('transactions')
          .select('id, merchant_name, amount, date, category')
          .eq('plaid_transaction_id', txn.transaction_id)
          .single();

        if (stored) {
          try {
            await analyzeTransaction(stored, supabase);
            analyzed++;
          } catch (err) {
            console.error('Analysis error for txn:', txn.transaction_id, err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      analyzed,
      message: synced > 0
        ? `Synced ${synced} transactions, analyzed ${analyzed}`
        : 'No new transactions to sync',
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
