import { NextResponse } from 'next/server';
import { creditAndNotifyAffiliate } from '@/lib/affiliate';
import {
  listPaidMembershipAccessWithoutMessage,
  listPendingMembershipAccess,
  markMembershipAccessPaid,
  markMembershipPaidMessageSent,
} from '@/lib/membership-access';
import { sendPaidAccessMessage } from '@/lib/roketchat';
import { isSingapayPaymentLinkFullyPaid } from '@/lib/singapay-payment-status';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.ROKETCHAT_ADMIN_SECRET;
  const authorization = request.headers.get('authorization') ?? '';
  const querySecret = new URL(request.url).searchParams.get('secret');

  return Boolean(secret) && (authorization === `Bearer ${secret}` || querySecret === secret);
}

async function sendPaidMessageIfNeeded(access: {
  reference: string;
  whatsapp_phone?: string;
  paid_message_sent_at?: string;
}) {
  if (!access.whatsapp_phone || access.paid_message_sent_at) return undefined;

  await sendPaidAccessMessage({
    phone: access.whatsapp_phone,
    reference: access.reference,
  });

  return new Date().toISOString();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const pendingLimit = Number(new URL(request.url).searchParams.get('limit') ?? 25);
  const limit = Number.isFinite(pendingLimit)
    ? Math.min(Math.max(Math.floor(pendingLimit), 1), 50)
    : 25;
  const pendingNewest = await listPendingMembershipAccess(limit, 'desc');
  const pendingOldest = await listPendingMembershipAccess(limit, 'asc');
  const pendingAccess = Array.from(
    new Map(
      [...pendingNewest, ...pendingOldest].map(access => [access.reference, access]),
    ).values(),
  );
  const paidWithoutMessage = await listPaidMembershipAccessWithoutMessage(limit);
  const synced: string[] = [];
  const messaged: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ reference: string; message: string }> = [];

  for (const access of pendingAccess) {
    if (!access.payment_url) {
      skipped.push(access.reference);
      continue;
    }

    const fullyPaid = await isSingapayPaymentLinkFullyPaid(access.payment_url).catch(
      () => false,
    );

    if (!fullyPaid) {
      skipped.push(access.reference);
      continue;
    }

    let paidMessageSentAt: string | undefined;

    try {
      paidMessageSentAt = await sendPaidMessageIfNeeded(access);
      if (paidMessageSentAt) messaged.push(access.reference);
    } catch (error) {
      failed.push({
        reference: access.reference,
        message: error instanceof Error ? error.message : 'Unknown message error',
      });
    }

    await markMembershipAccessPaid({
      reference: access.reference,
      paid_message_sent_at: paidMessageSentAt,
      raw_payload: {
        source: 'auto_sync_payment_link',
        checked_at: new Date().toISOString(),
        payment_link_status: 'fully_paid',
      },
    });
    await creditAndNotifyAffiliate(access.reference);
    synced.push(access.reference);
  }

  for (const access of paidWithoutMessage) {
    try {
      const paidMessageSentAt = await sendPaidMessageIfNeeded(access);
      if (!paidMessageSentAt) continue;
      await markMembershipPaidMessageSent(access.reference, paidMessageSentAt);
      messaged.push(access.reference);
    } catch (error) {
      failed.push({
        reference: access.reference,
        message: error instanceof Error ? error.message : 'Unknown message error',
      });
    }
  }

  return NextResponse.json({
    ok: true,
    checked: pendingAccess.length,
    synced,
    messaged,
    skipped,
    failed,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
