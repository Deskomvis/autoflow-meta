import { createHmac } from 'node:crypto';

type SingapayTokenResponse = {
  access_token?: string;
  data?: {
    access_token?: string;
  };
};

type PaymentHistory = {
  reff_no?: string;
  reference?: string;
  merchant_reff_no?: string;
  payment_link_reff_no?: string | null;
  payment_link?: {
    reff_no?: string;
    reference?: string;
    merchant_reff_no?: string;
  } | null;
  status?: string;
  status_computed?: string;
  payment_date?: string | null;
  id?: number;
};

type PaymentHistoryResponse = {
  data?: PaymentHistory[];
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getBaseUrl() {
  return (
    process.env.SINGAPAY_BASE_URL?.replace(/\/+$/, '') ??
    'https://sandbox-payment-b2b.singapay.id'
  );
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

  if (!response.ok) return null;

  return body?.access_token ?? body?.data?.access_token ?? null;
}

export async function isSingapayPaymentReferencePaid(reference: string) {
  const baseUrl = getBaseUrl();
  const apiKey = requiredEnv('SINGAPAY_API_KEY');
  const accountId = requiredEnv('SINGAPAY_ACCOUNT_ID');
  const accessToken = await requestAccessToken(baseUrl);

  if (!accessToken) return false;

  async function listHistories(params: Record<string, string>) {
    const url = new URL(`${baseUrl}/api/v1.0/payment-link-histories/${accountId}`);
    url.searchParams.set('per_page', '25');
    url.searchParams.set('sort_by', 'created_at');
    url.searchParams.set('sort_order', 'desc');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-PARTNER-ID': apiKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const body = (await response
      .json()
      .catch(() => null)) as PaymentHistoryResponse | null;

    return Array.isArray(body?.data) ? body.data : [];
  }

  function hasPaidReference(history: PaymentHistory) {
    const matchesReference =
      history.reff_no?.toUpperCase() === reference ||
      history.reference?.toUpperCase() === reference ||
      history.merchant_reff_no?.toUpperCase() === reference ||
      history.payment_link_reff_no?.toUpperCase() === reference ||
      history.payment_link?.reff_no?.toUpperCase() === reference ||
      history.payment_link?.reference?.toUpperCase() === reference ||
      history.payment_link?.merchant_reff_no?.toUpperCase() === reference;
    const status = (history.status_computed ?? history.status ?? '').toLowerCase();

    return matchesReference && status === 'paid';
  }

  const directMatches = await listHistories({ reff_no: reference });
  if (directMatches.some(hasPaidReference)) return true;

  const recentPaid = await listHistories({ status: 'paid' });
  return recentPaid.some(hasPaidReference);
}

export async function getSingapayPaymentLinkReference(transactionId: string) {
  const baseUrl = getBaseUrl();
  const apiKey = requiredEnv('SINGAPAY_API_KEY');
  const accountId = requiredEnv('SINGAPAY_ACCOUNT_ID');
  const accessToken = await requestAccessToken(baseUrl);

  if (!accessToken) return null;

  const url = new URL(`${baseUrl}/api/v1.0/payment-link-histories/${accountId}`);
  url.searchParams.set('reff_no', transactionId);
  url.searchParams.set('per_page', '5');
  url.searchParams.set('sort_by', 'created_at');
  url.searchParams.set('sort_order', 'desc');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-PARTNER-ID': apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const body = (await response
    .json()
    .catch(() => null)) as PaymentHistoryResponse | null;
  const histories = Array.isArray(body?.data) ? body.data : [];
  const match = histories.find(
    (history) => history.reff_no?.toUpperCase() === transactionId.toUpperCase(),
  );

  return (
    match?.payment_link_reff_no ??
    match?.payment_link?.reff_no ??
    match?.reference ??
    match?.merchant_reff_no ??
    null
  );
}
