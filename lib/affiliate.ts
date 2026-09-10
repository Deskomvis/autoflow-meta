import { getMembershipAccess, requestSupabase } from '@/lib/membership-access';
import { sendAffiliateSaleMessage } from '@/lib/roketchat';
import { getSiteUrl } from '@/lib/site-url';

export type WithdrawalStatus = 'pending' | 'processing' | 'done' | 'rejected';

export type AffiliateRow = {
  owner_reference: string;
  affiliate_code: string;
  whatsapp_phone: string;
  activated_at: string;
};

export type AffiliateWithdrawal = {
  id: string;
  owner_reference: string;
  amount: number;
  status: WithdrawalStatus;
  note: string | null;
  requested_at: string;
  updated_at: string;
};

export type AffiliateConversion = {
  reference: string;
  downlinePhone: string | null;
  commission: number;
  creditedAt: string | null;
  paidAt: string | null;
};

export type AffiliateProfile = {
  activated: boolean;
  affiliateCode: string | null;
  whatsappPhone: string | null;
  commissionTotal: number;
  withdrawnOrPending: number;
  availableBalance: number;
  minWithdrawal: number;
  hasOpenWithdrawal: boolean;
  conversions: AffiliateConversion[];
  withdrawals: {
    id: string;
    amount: number;
    status: WithdrawalStatus;
    note: string | null;
    requestedAt: string;
  }[];
};

const RESERVED_CODES = new Set([
  'AFM',
  'AFF',
  'ADMIN',
  'AUTOFLOW',
  'ROKET',
  'ROKETMEDIA',
  'ROKETMARKET',
  'CLAUDE',
  'META',
  'TEST',
  'FREE',
  'GRATIS',
]);
const CODE_RE = /^[A-Z0-9]{4,16}$/;

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function isValidCodeShape(code: string) {
  return CODE_RE.test(code) && !RESERVED_CODES.has(code) && !code.startsWith('AFM');
}

export function minWithdrawal() {
  const value = Number(process.env.AFFILIATE_MIN_WITHDRAWAL);
  return Number.isFinite(value) && value > 0 ? value : 100_000;
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return digits || '-';
  const hidden = '*'.repeat(Math.max(2, digits.length - 7));
  return `${digits.slice(0, 4)}${hidden}${digits.slice(-3)}`;
}

async function readRows<T>(response: Response | null, context: string) {
  if (!response) return null;
  if (!response.ok) {
    console.warn(
      `affiliate-${context}-failed`,
      JSON.stringify({
        status: response.status,
        body: await response.text().catch(() => ''),
      }),
    );
    return null;
  }
  return (await response.json().catch(() => null)) as T[] | null;
}

export async function resolveAffiliateByCode(code: string): Promise<AffiliateRow | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const response = await requestSupabase(
    `affiliate?affiliate_code=eq.${encodeURIComponent(normalized)}&select=owner_reference,affiliate_code,whatsapp_phone,activated_at&limit=1`,
    { method: 'GET', headers: { Prefer: '' } },
  );
  const rows = await readRows<AffiliateRow>(response, 'resolve');
  return rows?.[0] ?? null;
}

export async function getAffiliateByOwner(ownerReference: string): Promise<AffiliateRow | null> {
  const response = await requestSupabase(
    `affiliate?owner_reference=eq.${encodeURIComponent(ownerReference)}&select=owner_reference,affiliate_code,whatsapp_phone,activated_at&limit=1`,
    { method: 'GET', headers: { Prefer: '' } },
  );
  const rows = await readRows<AffiliateRow>(response, 'owner-lookup');
  return rows?.[0] ?? null;
}

export async function activateAffiliate(input: {
  ownerReference: string;
  whatsappPhone: string;
  code: string;
}): Promise<
  { ok: true; row: AffiliateRow } | { ok: false; error: 'ALREADY_ACTIVATED' | 'CODE_TAKEN' | 'DB' }
> {
  const code = normalizeCode(input.code);

  if (await getAffiliateByOwner(input.ownerReference)) {
    return { ok: false, error: 'ALREADY_ACTIVATED' };
  }
  if (await resolveAffiliateByCode(code)) {
    return { ok: false, error: 'CODE_TAKEN' };
  }

  const response = await requestSupabase('affiliate', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      owner_reference: input.ownerReference,
      affiliate_code: code,
      whatsapp_phone: input.whatsappPhone,
    }),
  });

  if (!response) return { ok: false, error: 'DB' };
  if (response.status === 409) return { ok: false, error: 'CODE_TAKEN' };
  if (!response.ok) {
    console.warn(
      'affiliate-activate-failed',
      JSON.stringify({
        status: response.status,
        body: await response.text().catch(() => ''),
      }),
    );
    return { ok: false, error: 'DB' };
  }

  const rows = (await response.json().catch(() => null)) as AffiliateRow[] | null;
  const row = rows?.[0];
  return row ? { ok: true, row } : { ok: false, error: 'DB' };
}

export async function creditAffiliateCommission(reference: string): Promise<{ credited: boolean }> {
  const response = await requestSupabase(
    `membership_access?reference=eq.${encodeURIComponent(reference)}&commission_credited_at=is.null&affiliate_owner_reference=not.is.null`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ commission_credited_at: new Date().toISOString() }),
    },
  );

  if (!response || !response.ok) {
    if (response) {
      console.warn('affiliate-credit-failed', JSON.stringify({ status: response.status }));
    }
    return { credited: false };
  }

  const rows = (await response.json().catch(() => [])) as unknown[];
  return { credited: Array.isArray(rows) && rows.length > 0 };
}

export async function markAffiliateMessageSent(reference: string): Promise<void> {
  const response = await requestSupabase(
    `membership_access?reference=eq.${encodeURIComponent(reference)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ affiliate_message_sent_at: new Date().toISOString() }),
    },
  );
  if (response && !response.ok) {
    console.warn('affiliate-mark-message-failed', JSON.stringify({ status: response.status }));
  }
}

export async function getAffiliateProfile(ownerReference: string): Promise<AffiliateProfile> {
  const min = minWithdrawal();
  const affiliate = await getAffiliateByOwner(ownerReference);

  if (!affiliate) {
    return {
      activated: false,
      affiliateCode: null,
      whatsappPhone: null,
      commissionTotal: 0,
      withdrawnOrPending: 0,
      availableBalance: 0,
      minWithdrawal: min,
      hasOpenWithdrawal: false,
      conversions: [],
      withdrawals: [],
    };
  }

  const conversionResponse = await requestSupabase(
    `membership_access?affiliate_owner_reference=eq.${encodeURIComponent(ownerReference)}&status=eq.paid&select=reference,whatsapp_phone,commission_amount,commission_credited_at,paid_at&order=paid_at.desc`,
    { method: 'GET', headers: { Prefer: '' } },
  );
  const conversionRows =
    (await readRows<{
      reference: string;
      whatsapp_phone: string | null;
      commission_amount: number | null;
      commission_credited_at: string | null;
      paid_at: string | null;
    }>(conversionResponse, 'conversions')) ?? [];

  const withdrawalResponse = await requestSupabase(
    `affiliate_withdrawal?owner_reference=eq.${encodeURIComponent(ownerReference)}&select=id,owner_reference,amount,status,note,requested_at,updated_at&order=requested_at.desc`,
    { method: 'GET', headers: { Prefer: '' } },
  );
  const withdrawalRows =
    (await readRows<AffiliateWithdrawal>(withdrawalResponse, 'withdrawals')) ?? [];

  const commissionTotal = conversionRows
    .filter((row) => row.commission_credited_at)
    .reduce((sum, row) => sum + (row.commission_amount ?? 0), 0);

  const withdrawnOrPending = withdrawalRows
    .filter((row) => row.status !== 'rejected')
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  const hasOpenWithdrawal = withdrawalRows.some(
    (row) => row.status === 'pending' || row.status === 'processing',
  );

  return {
    activated: true,
    affiliateCode: affiliate.affiliate_code,
    whatsappPhone: affiliate.whatsapp_phone,
    commissionTotal,
    withdrawnOrPending,
    availableBalance: Math.max(0, commissionTotal - withdrawnOrPending),
    minWithdrawal: min,
    hasOpenWithdrawal,
    conversions: conversionRows.map((row) => ({
      reference: row.reference,
      downlinePhone: row.whatsapp_phone,
      commission: row.commission_amount ?? 0,
      creditedAt: row.commission_credited_at,
      paidAt: row.paid_at,
    })),
    withdrawals: withdrawalRows.map((row) => ({
      id: row.id,
      amount: row.amount,
      status: row.status,
      note: row.note,
      requestedAt: row.requested_at,
    })),
  };
}

export async function requestWithdrawal(input: { ownerReference: string }): Promise<
  | { ok: true; row: AffiliateWithdrawal }
  | {
      ok: false;
      error: 'NOT_ACTIVE' | 'PENDING_EXISTS' | 'BELOW_MIN' | 'NO_BALANCE' | 'DB';
    }
> {
  const profile = await getAffiliateProfile(input.ownerReference);
  if (!profile.activated) return { ok: false, error: 'NOT_ACTIVE' };
  if (profile.hasOpenWithdrawal) return { ok: false, error: 'PENDING_EXISTS' };
  if (profile.availableBalance <= 0) return { ok: false, error: 'NO_BALANCE' };
  if (profile.availableBalance < profile.minWithdrawal) {
    return { ok: false, error: 'BELOW_MIN' };
  }

  const response = await requestSupabase('affiliate_withdrawal', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      owner_reference: input.ownerReference,
      amount: profile.availableBalance,
      status: 'pending',
    }),
  });

  if (!response || !response.ok) {
    if (response) {
      console.warn(
        'affiliate-withdraw-failed',
        JSON.stringify({
          status: response.status,
          body: await response.text().catch(() => ''),
        }),
      );
    }
    return { ok: false, error: 'DB' };
  }

  const rows = (await response.json().catch(() => null)) as AffiliateWithdrawal[] | null;
  const row = rows?.[0];
  return row ? { ok: true, row } : { ok: false, error: 'DB' };
}

export async function listWithdrawals(status?: WithdrawalStatus): Promise<AffiliateWithdrawal[]> {
  const filter = status ? `&status=eq.${status}` : '';
  const response = await requestSupabase(
    `affiliate_withdrawal?select=id,owner_reference,amount,status,note,requested_at,updated_at&order=requested_at.desc${filter}`,
    { method: 'GET', headers: { Prefer: '' } },
  );
  return (await readRows<AffiliateWithdrawal>(response, 'list')) ?? [];
}

export async function updateWithdrawalStatus(input: {
  id: string;
  status: WithdrawalStatus;
  note?: string;
}): Promise<{ ok: true; row: AffiliateWithdrawal } | { ok: false; error: 'NOT_FOUND' | 'DB' }> {
  const patch: Record<string, unknown> = { status: input.status };
  if (typeof input.note === 'string') patch.note = input.note;

  const response = await requestSupabase(
    `affiliate_withdrawal?id=eq.${encodeURIComponent(input.id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    },
  );

  if (!response || !response.ok) return { ok: false, error: 'DB' };
  const rows = (await response.json().catch(() => null)) as AffiliateWithdrawal[] | null;
  const row = rows?.[0];
  return row ? { ok: true, row } : { ok: false, error: 'NOT_FOUND' };
}

// Response shape shared by every /api/membership/profile* route.
export function serializeAffiliateProfile(profile: AffiliateProfile, phone: string | null) {
  return {
    phone,
    activated: profile.activated,
    affiliateCode: profile.affiliateCode,
    affiliateLink: profile.affiliateCode ? `${getSiteUrl()}/?aff=${profile.affiliateCode}` : null,
    commissionTotal: profile.commissionTotal,
    withdrawnOrPending: profile.withdrawnOrPending,
    availableBalance: profile.availableBalance,
    minWithdrawal: profile.minWithdrawal,
    hasOpenWithdrawal: profile.hasOpenWithdrawal,
    conversions: profile.conversions.map((conversion) => ({
      downlinePhone: maskPhone(conversion.downlinePhone),
      commission: conversion.commission,
      paidAt: conversion.paidAt,
      creditedAt: conversion.creditedAt,
    })),
    withdrawals: profile.withdrawals,
  };
}

// Shared by the Singapay webhook and the verify fallback path. Idempotent:
// commission is credited once, and at most one WhatsApp message is sent.
export async function creditAndNotifyAffiliate(reference: string): Promise<void> {
  try {
    const row = await getMembershipAccess(reference);
    if (!row?.affiliate_owner_reference || (row.commission_amount ?? 0) <= 0) {
      return;
    }

    const { credited } = await creditAffiliateCommission(reference);
    if (!credited || row.affiliate_message_sent_at) return;

    const owner = await getAffiliateByOwner(row.affiliate_owner_reference);
    if (!owner?.whatsapp_phone) return;

    const profile = await getAffiliateProfile(owner.owner_reference);
    await sendAffiliateSaleMessage({
      phone: owner.whatsapp_phone,
      downlinePhone: row.whatsapp_phone ?? '-',
      commission: row.commission_amount ?? 0,
      commissionTotal: profile.commissionTotal,
    });
    await markAffiliateMessageSent(reference);
  } catch (error) {
    console.warn(
      'affiliate-credit-notify-failed',
      JSON.stringify({
        reference,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    );
  }
}
