import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const amount = 497000;
const productName = 'Auto Flow Meta Ads dengan Claude AI';

type SingapayTokenResponse = {
  access_token?: string;
};

type SingapayPaymentLinkResponse = {
  data?: {
    payment_url?: string;
  };
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .replaceAll('-', '');
}

function getBaseUrl() {
  return (
    process.env.SINGAPAY_BASE_URL?.replace(/\/+$/, '') ??
    'https://sandbox-payment-b2b.singapay.id'
  );
}

async function requestAccessToken(baseUrl: string) {
  const clientId = requiredEnv('SINGAPAY_CLIENT_ID');
  const clientSecret = requiredEnv('SINGAPAY_CLIENT_SECRET');
  const apiKey = requiredEnv('SINGAPAY_API_KEY');
  const payload = `${clientId}_${clientSecret}_${jakartaDate()}`;
  const signature = createHmac('sha512', clientSecret)
    .update(payload)
    .digest('hex');

  const response = await fetch(`${baseUrl}/api/v1.1/access-token/b2b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PARTNER-ID': apiKey,
      'X-CLIENT-ID': clientId,
      'X-Signature': signature,
    },
    body: JSON.stringify({ grant_type: 'client_credentials' }),
    cache: 'no-store',
  });

  const body = (await response
    .json()
    .catch(() => null)) as SingapayTokenResponse | null;
  if (!response.ok || !body?.access_token) {
    return {
      error: true as const,
      status: response.status,
      body,
    };
  }

  return { error: false as const, accessToken: body.access_token as string };
}

export async function POST(request: Request) {
  try {
    const baseUrl = getBaseUrl();
    const apiKey = requiredEnv('SINGAPAY_API_KEY');
    const accountId = requiredEnv('SINGAPAY_ACCOUNT_ID');
    const tokenResult = await requestAccessToken(baseUrl);

    if (tokenResult.error) {
      return NextResponse.json(
        {
          error: 'SINGAPAY_TOKEN_FAILED',
          message: 'Belum bisa membuat token sandbox Singapay.',
          detail: tokenResult.body,
        },
        { status: 502 },
      );
    }

    const origin = new URL(request.url).origin;
    const reference = `AFM-${Date.now().toString(36).toUpperCase()}`;
    const response = await fetch(
      `${baseUrl}/api/v2.0/payment-link/${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          'Content-Type': 'application/json',
          'X-PARTNER-ID': apiKey,
        },
        body: JSON.stringify({
          reff_no: reference,
          description: productName,
          payment_link_type: 'total',
          total_amount: amount,
          max_usage: 1,
          success_redirect_url: `${origin}/?payment=success#akses`,
          expired_redirect_url: `${origin}/?payment=expired#akses`,
          optional_metadata: {
            product: 'autoflow-meta',
            source: 'landing-page',
          },
        }),
        cache: 'no-store',
      },
    );

    const body = (await response
      .json()
      .catch(() => null)) as SingapayPaymentLinkResponse | null;
    const paymentUrl = body?.data?.payment_url;

    if (!response.ok || !paymentUrl) {
      return NextResponse.json(
        {
          error: 'SINGAPAY_PAYMENT_LINK_FAILED',
          message: 'Belum bisa membuat payment link sandbox Singapay.',
          detail: body,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      paymentUrl,
      reference,
      amount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'SINGAPAY_CHECKOUT_NOT_CONFIGURED',
        message:
          error instanceof Error
            ? error.message
            : 'Konfigurasi checkout Singapay belum lengkap.',
      },
      { status: 500 },
    );
  }
}
