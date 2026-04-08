import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

type PaymentIntentBody = {
  amount?: number;
  currency?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  shipping?: {
    address1?: string;
    city?: string;
    country?: string;
    province?: string;
    zip?: string;
  };
  metadata?: Record<string, string>;
};

const DEFAULT_API_BASE = 'https://xstak-pay-stg.xstak.com';

export async function POST(req: Request) {
  try {
    const accountId = process.env.XPAY_ACCOUNT_ID;
    const apiKey = process.env.XPAY_API_KEY;
    const hmacSecret = process.env.XPAY_HMAC_SECRET;
    const apiBase = process.env.XPAY_API_BASE_URL || DEFAULT_API_BASE;

    if (!accountId || !apiKey || !hmacSecret) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing XPAY_ACCOUNT_ID, XPAY_API_KEY or XPAY_HMAC_SECRET on server.',
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as PaymentIntentBody;
    const amount = Number(body?.amount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Amount must be greater than 0.' }, { status: 400 });
    }

    const payload = {
      amount,
      currency: body?.currency || 'PKR',
      payment_method_types: 'card',
      customer: {
        email: body?.customer?.email || '',
        name: body?.customer?.name || '',
        phone: body?.customer?.phone || '',
      },
      shipping: {
        address1: body?.shipping?.address1 || '',
        city: body?.shipping?.city || '',
        country: body?.shipping?.country || 'PK',
        province: body?.shipping?.province || '',
        zip: body?.shipping?.zip || '00000',
      },
      metadata: body?.metadata || {},
    };

    const signature = createHmac('sha256', hmacSecret).update(JSON.stringify(payload)).digest('hex');

    const response = await fetch(`${apiBase}/public/v1/payment/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-signature': signature,
        'x-account-id': accountId,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || data?.error || 'Failed to create XPay payment intent.',
          raw: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: data?.data?.pi_client_secret,
      encryptionKey: data?.data?.encryptionKey,
      raw: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected XPay integration error.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}