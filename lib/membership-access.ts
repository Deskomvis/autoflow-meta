type AccessStatus = 'pending' | 'paid';

type MembershipAccessPayload = {
  reference: string;
  status: AccessStatus;
  amount?: number;
  payment_url?: string;
  singapay_transaction_id?: string;
  paid_at?: string;
  raw_payload?: unknown;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return { url, key };
}

async function requestSupabase(path: string, init: RequestInit = {}) {
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
      singapay_transaction_id: payload.singapay_transaction_id ?? null,
      paid_at: payload.paid_at ?? null,
      raw_payload: payload.raw_payload ?? null,
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
