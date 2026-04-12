import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeTransaction } from '@/lib/anthropic/analyze-transaction';

export async function POST(req: NextRequest) {
  try {
    const { transaction_id } = await req.json();
    const supabase = createAdminClient();

    // Fetch the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('id, merchant_name, amount, date, category')
      .eq('id', transaction_id)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const result = await analyzeTransaction(transaction, supabase);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
