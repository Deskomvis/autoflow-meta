import { NextResponse } from 'next/server';
import { isMembershipReferencePaid } from '@/lib/membership-access';
import { syncPaidMembershipAccessFromPaymentLink } from '@/lib/singapay-paid-sync';
import { isSingapayPaymentReferencePaid } from '@/lib/singapay-payment-status';

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
  let paidAccess = reference ? await isMembershipReferencePaid(reference) : false;

  if (reference && paidAccess === false && looksLikePaymentReference(reference)) {
    const singapayPaid = await isSingapayPaymentReferencePaid(reference).catch(
      () => false,
    );
    const syncResult = await syncPaidMembershipAccessFromPaymentLink(
      reference,
      singapayPaid ? 'membership_verify_api' : 'membership_verify_payment_link',
    ).catch(() => ({ synced: false }));

    if (singapayPaid || syncResult.synced) paidAccess = true;
  }

  const isAllowed =
    paidAccess ?? (codes.length
      ? codes.includes(reference)
      : looksLikePaymentReference(reference));

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
