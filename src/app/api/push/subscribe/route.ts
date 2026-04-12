import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { endpoint, keys } = await req.json();
    const supabase = createAdminClient();

    await supabase.from('push_subscriptions').upsert(
      {
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        active: true,
      },
      { onConflict: 'endpoint' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    const supabase = createAdminClient();

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
