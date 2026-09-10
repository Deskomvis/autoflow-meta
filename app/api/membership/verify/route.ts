import { NextResponse } from 'next/server';
import {
  getMembershipAccess,
  isMembershipReferencePaid,
  markMembershipAccessPaid,
} from '@/lib/membership-access';
import { creditAndNotifyAffiliate } from '@/lib/affiliate';
import { sendPaidAccessMessage } from '@/lib/roketchat';
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

    if (singapayPaid) {
      const access = await getMembershipAccess(reference);
      let paidMessageSentAt: string | undefined;

      if (access?.whatsapp_phone && !access.paid_message_sent_at) {
        try {
          await sendPaidAccessMessage({
            phone: access.whatsapp_phone,
            reference,
          });
          paidMessageSentAt = new Date().toISOString();
        } catch (error) {
          console.warn(
            'roketchat-paid-message-failed',
            JSON.stringify({
              reference,
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
          );
        }
      }

      await markMembershipAccessPaid({ reference, paid_message_sent_at: paidMessageSentAt });
      await creditAndNotifyAffiliate(reference);
      paidAccess = true;
    }
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
