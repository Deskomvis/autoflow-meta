type AccessStatus = 'pending' | 'paid';

type MembershipAccessPayload = {
  reference: string;
  status: AccessStatus;
  amount?: number;
  payment_url?: string;
  whatsapp_phone?: string;
  unpaid_message_sent_at?: string;
  paid_message_sent_at?: string;
  singapay_transaction_id?: string;
  paid_at?: string;
  raw_payload?: unknown;
  affiliate_code?: string;
  affiliate_owner_reference?: string;
  original_amount?: number;
  discount_amount?: number;
  commission_amount?: number;
  commission_credited_at?: string;
  affiliate_message_sent_at?: string;
};

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return { url, key };
}

export async function requestSupabase(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();

  if (!config) return null;

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

export async function createMembershipAccess(payload: MembershipAccessPayload) {
  const response = await requestSupabase('membership_access', {
    method: 'POST',
    body: JSON.stringify({
      reference: payload.reference,
      status: payload.status,
      amount: payload.amount ?? null,
      payment_url: payload.payment_url ?? null,
      whatsapp_phone: payload.whatsapp_phone ?? null,
      unpaid_message_sent_at: payload.unpaid_message_sent_at ?? null,
      paid_message_sent_at: payload.paid_message_sent_at ?? null,
      singapay_transaction_id: payload.singapay_transaction_id ?? null,
      paid_at: payload.paid_at ?? null,
      raw_payload: payload.raw_payload ?? null,
      affiliate_code: payload.affiliate_code ?? null,
      affiliate_owner_reference: payload.affiliate_owner_reference ?? null,
      original_amount: payload.original_amount ?? null,
      discount_amount: payload.discount_amount ?? null,
      commission_amount: payload.commission_amount ?? null,
    }),
  });

  if (!response || response.ok) return;

  console.warn(
    'membership-access-create-failed',
    JSON.stringify({ status: response.status, body: await response.text() }),
  );
}

export async function markMembershipAccessPaid(payload: {
  reference: string;
  singapay_transaction_id?: string;
  paid_message_sent_at?: string;
  raw_payload?: unknown;
}) {
  const response = await requestSupabase('membership_access?on_conflict=reference', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      reference: payload.reference,
      status: 'paid',
      paid_at: new Date().toISOString(),
      paid_message_sent_at: payload.paid_message_sent_at ?? undefined,
      singapay_transaction_id: payload.singapay_transaction_id ?? null,
      raw_payload: payload.raw_payload ?? null,
    }),
  });

  if (!response || response.ok) return;

  console.warn(
    'membership-access-paid-failed',
    JSON.stringify({ status: response.status, body: await response.text() }),
  );
}

export async function markMembershipUnpaidMessageSent(reference: string) {
  const response = await requestSupabase(
    `membership_access?reference=eq.${encodeURIComponent(reference)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        unpaid_message_sent_at: new Date().toISOString(),
      }),
    },
  );

  if (!response || response.ok) return;

  console.warn(
    'membership-access-unpaid-message-failed',
    JSON.stringify({ status: response.status, body: await response.text() }),
  );
}

export async function getMembershipAccess(reference: string) {
  const response = await requestSupabase(
    `membership_access?reference=eq.${encodeURIComponent(reference)}&select=reference,status,payment_url,whatsapp_phone,unpaid_message_sent_at,paid_message_sent_at,affiliate_code,affiliate_owner_reference,commission_amount,commission_credited_at,affiliate_message_sent_at&limit=1`,
    {
      method: 'GET',
      headers: {
        Prefer: '',
      },
    },
  );

  if (!response) return null;
  if (!response.ok) {
    console.warn(
      'membership-access-get-failed',
      JSON.stringify({ status: response.status, body: await response.text() }),
    );
    return null;
  }

  const data = (await response.json().catch(() => [])) as MembershipAccessPayload[];
  return data[0] ?? null;
}

export async function isMembershipReferencePaid(reference: string) {
  const response = await requestSupabase(
    `membership_access?reference=eq.${encodeURIComponent(reference)}&status=eq.paid&select=reference&limit=1`,
    {
      method: 'GET',
      headers: {
        Prefer: '',
      },
    },
  );

  if (!response) return null;
  if (!response.ok) {
    console.warn(
      'membership-access-verify-failed',
      JSON.stringify({ status: response.status, body: await response.text() }),
    );
    return false;
  }

  const data = (await response.json().catch(() => [])) as unknown[];
  return data.length > 0;
}

export async function getPaidMembershipAccessCount() {
  const response = await requestSupabase(
    'membership_access?status=eq.paid&select=reference',
    {
      method: 'HEAD',
      headers: {
        Prefer: 'count=exact',
      },
    },
  );

  if (!response) return null;
  if (!response.ok) {
    console.warn(
      'membership-access-count-failed',
      JSON.stringify({ status: response.status, body: await response.text() }),
    );
    return null;
  }

  const range = response.headers.get('content-range');
  const total = range?.split('/').at(1);
  const count = total ? Number(total) : NaN;

  return Number.isFinite(count) ? count : null;
}
