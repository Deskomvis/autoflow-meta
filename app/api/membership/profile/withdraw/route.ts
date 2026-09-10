import { NextResponse } from 'next/server';
import {
  getAffiliateByOwner,
  getAffiliateProfile,
  requestWithdrawal,
  serializeAffiliateProfile,
} from '@/lib/affiliate';
import { getMembershipAccess, isMembershipReferencePaid } from '@/lib/membership-access';
import { sendWithdrawalRequestAdminMessage } from '@/lib/roketchat';

export const runtime = 'nodejs';

type WithdrawRequest = {
  reference?: string;
};

const ERROR_COPY: Record<string, { status: number; message: string }> = {
  NOT_ACTIVE: {
    status: 409,
    message: 'Aktifkan affiliate dulu sebelum ajukan pencairan.',
  },
  PENDING_EXISTS: {
    status: 409,
    message: 'Masih ada permintaan pencairan yang belum selesai.',
  },
  BELOW_MIN: {
    status: 400,
    message: 'Saldo belum mencapai minimum pencairan.',
  },
  NO_BALANCE: {
    status: 400,
    message: 'Belum ada komisi yang bisa dicairkan.',
  },
  DB: { status: 500, message: 'Gagal menyimpan. Coba lagi sebentar.' },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WithdrawRequest | null;
  const reference = body?.reference?.trim().toUpperCase() ?? '';

  if (!reference || (await isMembershipReferencePaid(reference)) !== true) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await requestWithdrawal({ ownerReference: reference });
  if (!result.ok) {
    const copy = ERROR_COPY[result.error] ?? ERROR_COPY.DB;
    return NextResponse.json(
      { ok: false, error: result.error, message: copy.message },
      { status: copy.status },
    );
  }

  try {
    const affiliate = await getAffiliateByOwner(reference);
    if (affiliate) {
      await sendWithdrawalRequestAdminMessage({
        adminPhone: process.env.AFFILIATE_ADMIN_PHONE || '6285741813147',
        affiliatePhone: affiliate.whatsapp_phone,
        affiliateCode: affiliate.affiliate_code,
        amount: result.row.amount,
      });
    }
  } catch (error) {
    console.warn(
      'affiliate-withdraw-admin-notify-failed',
      JSON.stringify({
        reference,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    );
  }

  const [access, profile] = await Promise.all([
    getMembershipAccess(reference),
    getAffiliateProfile(reference),
  ]);
  return NextResponse.json({
    ok: true,
    ...serializeAffiliateProfile(profile, access?.whatsapp_phone ?? null),
  });
}
