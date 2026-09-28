import { creditAndNotifyAffiliate } from '@/lib/affiliate';
import { getMembershipAccess, markMembershipAccessPaid, markMembershipPaidMessageSent } from '@/lib/membership-access';
import { sendPaidAccessMessage } from '@/lib/roketchat';
import { isSingapayPaymentLinkFullyPaid } from '@/lib/singapay-payment-status';
import { sendMetaConversion } from '@/lib/meta-conversions';

export async function syncPaidMembershipAccessFromPaymentLink(
  reference: string,
  source: string,
) {
  const normalizedReference = reference.trim().toUpperCase();
  if (!/^AFM-[A-Z0-9-]{4,}$/i.test(normalizedReference)) {
    return { synced: false, reason: 'invalid-reference' };
  }

  const access = await getMembershipAccess(normalizedReference);
  if (!access) {
    return { synced: false, reason: 'payment-link-missing' };
  }

  if (access.status === 'paid' && access.paid_message_sent_at) {
    return { synced: false, reason: 'already-synced' };
  }

  const fullyPaid = access.status === 'paid' || (access.payment_url && await isSingapayPaymentLinkFullyPaid(access.payment_url));
  if (!fullyPaid) return { synced: false, reason: 'not-paid' };

  if (access.status !== 'paid') await markMembershipAccessPaid({
    reference: normalizedReference,
    raw_payload: {
      source,
      checked_at: new Date().toISOString(),
      payment_link_status: 'fully_paid',
    },
  });
  let paidMessageSentAt: string | undefined;
  if (access.whatsapp_phone && !access.paid_message_sent_at) {
    try {
      await sendPaidAccessMessage({ phone: access.whatsapp_phone, reference: normalizedReference });
      paidMessageSentAt = new Date().toISOString();
      await markMembershipPaidMessageSent(normalizedReference, paidMessageSentAt);
    } catch (error) {
      console.warn('roketchat-paid-message-failed', JSON.stringify({
        reference: normalizedReference,
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }
  if (access.status !== 'paid') {
    await sendMetaConversion({
      eventName: 'Purchase',
      eventId: `purchase-${normalizedReference}`,
      eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autoflow.roketmedia.id'}/thank-you?ref=${encodeURIComponent(normalizedReference)}`,
      value: Number(access.amount) || 0,
      phone: access.whatsapp_phone,
    }).catch((error) => {
      console.warn(
        'meta-purchase-sync-failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    });
  }
  await creditAndNotifyAffiliate(normalizedReference);

  return { synced: true, paidMessageSentAt };
}
