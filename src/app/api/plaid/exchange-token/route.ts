import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncTransactions } from '@/lib/plaid/sync';
import { categorizeByMerchant } from '@/lib/categories';

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution } = await req.json();

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;
    const supabase = createAdminClient();

    // Store the connection
    await supabase.from('plaid_connections').upsert(
      {
        item_id,
        access_token,
        institution_name: institution?.name || 'Unknown Bank',
      },
      { onConflict: 'item_id' }
    );

    // Trigger initial transaction sync (pulls historical transactions)
    let synced = 0;
    try {
      const { added, cursor } = await syncTransactions(access_token, null);

      // Update cursor
      await supabase
        .from('plaid_connections')
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq('item_id', item_id);

      // Store transactions
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
      }
    } catch (syncErr) {
      // Don't fail the whole request if initial sync fails — webhook will catch up
      console.error('Initial sync error (non-fatal):', syncErr);
    }

    return NextResponse.json({ success: true, item_id, synced });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}
