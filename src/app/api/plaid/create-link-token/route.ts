import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { CountryCode, Products } from 'plaid';

export async function POST() {
  try {
    const isProduction = process.env.PLAID_ENV === 'production';

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'pocketwatch-user' },
      client_name: 'PocketWatch',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
      // OAuth redirect URI required for production banks
      ...(isProduction && process.env.PLAID_REDIRECT_URI
        ? { redirect_uri: process.env.PLAID_REDIRECT_URI }
        : {}),
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
