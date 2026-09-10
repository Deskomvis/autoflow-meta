import { NextResponse } from 'next/server';
import {
  getMembershipAccess,
  markMembershipUnpaidMessageSent,
} from '@/lib/membership-access';
import { sendCheckoutGreeting } from '@/lib/roketchat';
import { getSingapayPaymentLinkReference } from '@/lib/singapay-payment-status';

export const runtime = 'nodejs';

type ResendPendingRequest = {
  reference?: string;
  transactionId?: string;
};

function isAuthorized(request: Request) {
  const secret = process.env.ROKETCHAT_ADMIN_SECRET;
  const authorization = request.headers.get('authorization') ?? '';

  return Boolean(secret) && authorization === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | ResendPendingRequest
    | null;
  const reference = (
    body?.reference ??
    (body?.transactionId
      ? await getSingapayPaymentLinkReference(body.transactionId)
      : '')
  )
    ?.trim()
    .toUpperCase();

  if (!reference) {
    return NextResponse.json(
      { ok: false, message: 'Reference tidak ditemukan.' },
      { status: 404 },
    );
  }

  const access = await getMembershipAccess(reference);

  if (!access?.whatsapp_phone || !access.payment_url) {
    return NextResponse.json(
      { ok: false, reference, message: 'Nomor WA atau payment link belum tersimpan.' },
      { status: 404 },
    );
  }

  await sendCheckoutGreeting({
    phone: access.whatsapp_phone,
    paymentUrl: access.payment_url,
  });
  await markMembershipUnpaidMessageSent(reference);

  return NextResponse.json({ ok: true, reference, sent: true });
}
