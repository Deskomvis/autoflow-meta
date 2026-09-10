import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createMembershipAccess,
  markMembershipUnpaidMessageSent,
} from '@/lib/membership-access';
import {
  normalizeWhatsappPhone,
  sendCheckoutGreeting,
} from '@/lib/roketchat';

export const runtime = 'nodejs';

const amount = 497000;
const productName = 'Auto Flow Meta Ads dengan Claude AI';

type SingapayTokenResponse = {
  access_token?: string;
  data?: {
    access_token?: string;
  };
};

type SingapayPaymentLinkResponse = {
  data?: {
    payment_url?: string;
  };
};
type CheckoutRequest = {
  whatsappPhone?: string;
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

function getSiteUrl(request: Request) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.APP_URL;

  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  return new URL(request.url).origin;
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
  const accessToken = body?.access_token ?? body?.data?.access_token;
  if (!response.ok || !accessToken) {
    return {
      error: true as const,
      status: response.status,
      body,
    };
  }

  return { error: false as const, accessToken };
}

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json().catch(() => null)) as
      | CheckoutRequest
      | null;
    const whatsappPhone = normalizeWhatsappPhone(
      requestBody?.whatsappPhone ?? '',
    );

    if (!/^62\d{8,14}$/.test(whatsappPhone)) {
      return NextResponse.json(
        {
          error: 'INVALID_WHATSAPP_PHONE',
          message: 'Masukkan nomor WhatsApp aktif, contoh 085741813147.',
        },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl();
    const apiKey = requiredEnv('SINGAPAY_API_KEY');
    const accountId = requiredEnv('SINGAPAY_ACCOUNT_ID');
    const tokenResult = await requestAccessToken(baseUrl);

    if (tokenResult.error) {
      return NextResponse.json(
        {
          error: 'SINGAPAY_TOKEN_FAILED',
          message: 'Belum bisa menyiapkan pembayaran Singapay.',
          detail: tokenResult.body,
        },
        { status: 502 },
      );
    }

    const origin = getSiteUrl(request);
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
          success_redirect_url: `${origin}/thank-you?ref=${reference}`,
          expired_redirect_url: `${origin}/?payment=expired#akses`,
          optional_metadata: {
            product: 'autoflow-meta',
            source: 'landing-page',
            whatsapp_phone: whatsappPhone,
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
          message: 'Belum bisa membuat link pembayaran Singapay.',
          detail: body,
        },
        { status: 502 },
      );
    }

    await createMembershipAccess({
      reference,
      status: 'pending',
      amount,
      payment_url: paymentUrl,
      whatsapp_phone: whatsappPhone,
    });

    sendCheckoutGreeting({ phone: whatsappPhone, paymentUrl })
      .then(() => markMembershipUnpaidMessageSent(reference))
      .catch((error) => {
        console.warn(
          'roketchat-unpaid-greeting-failed',
          JSON.stringify({
            reference,
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        );
      });

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
