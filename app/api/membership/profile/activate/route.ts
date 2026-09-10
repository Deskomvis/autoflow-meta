import { NextResponse } from 'next/server';
import {
  activateAffiliate,
  getAffiliateProfile,
  isValidCodeShape,
  normalizeCode,
  serializeAffiliateProfile,
} from '@/lib/affiliate';
import { getMembershipAccess, isMembershipReferencePaid } from '@/lib/membership-access';

export const runtime = 'nodejs';

type ActivateRequest = {
  reference?: string;
  code?: string;
};

const ERROR_COPY: Record<string, { status: number; message: string }> = {
  INVALID_CODE: {
    status: 400,
    message: 'Kode harus 4-16 karakter huruf/angka dan bukan kata yang dipakai sistem.',
  },
  NO_PHONE: {
    status: 409,
    message: 'Nomor WhatsApp belum tersimpan di data pembelianmu.',
  },
  ALREADY_ACTIVATED: {
    status: 409,
    message: 'Affiliate kamu sudah aktif dan kodenya tidak bisa diganti.',
  },
  CODE_TAKEN: {
    status: 409,
    message: 'Kode itu sudah dipakai orang lain. Pilih yang lain.',
  },
  DB: { status: 500, message: 'Gagal menyimpan. Coba lagi sebentar.' },
};

function fail(error: string) {
  const copy = ERROR_COPY[error] ?? ERROR_COPY.DB;
  return NextResponse.json({ ok: false, error, message: copy.message }, { status: copy.status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ActivateRequest | null;
  const reference = body?.reference?.trim().toUpperCase() ?? '';

  if (!reference || (await isMembershipReferencePaid(reference)) !== true) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const access = await getMembershipAccess(reference);
  if (!access?.whatsapp_phone) return fail('NO_PHONE');

  const code = normalizeCode(body?.code ?? '');
  if (!isValidCodeShape(code)) return fail('INVALID_CODE');

  const result = await activateAffiliate({
    ownerReference: reference,
    whatsappPhone: access.whatsapp_phone,
    code,
  });
  if (!result.ok) return fail(result.error);

  const profile = await getAffiliateProfile(reference);
  return NextResponse.json({
    ok: true,
    ...serializeAffiliateProfile(profile, access.whatsapp_phone),
  });
}
