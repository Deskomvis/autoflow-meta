import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type VerifyRequest = {
  reference?: string;
};

function configuredCodes() {
  return (process.env.MEMBERSHIP_ACCESS_CODES ?? '')
    .split(',')
    .map(code => code.trim().toUpperCase())
    .filter(Boolean);
}

function looksLikePaymentReference(reference: string) {
  return /^AFM-[A-Z0-9-]{4,}$/i.test(reference);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as VerifyRequest | null;
  const reference = body?.reference?.trim().toUpperCase() ?? '';
  const codes = configuredCodes();
  const isAllowed = codes.length
    ? codes.includes(reference)
    : looksLikePaymentReference(reference);

  if (!reference || !isAllowed) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Kode referensi belum cocok. Periksa lagi kode pembayaranmu.',
      },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, reference });
}
