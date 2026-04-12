import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { createAdminClient } from '@/lib/supabase/admin';

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

    return NextResponse.json({ success: true, item_id });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}
