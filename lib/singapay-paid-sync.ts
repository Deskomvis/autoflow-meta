import { creditAndNotifyAffiliate } from '@/lib/affiliate';
import { getMembershipAccess, markMembershipAccessPaid } from '@/lib/membership-access';
import { sendPaidAccessMessage } from '@/lib/roketchat';
import { isSingapayPaymentLinkFullyPaid } from '@/lib/singapay-payment-status';

export async function syncPaidMembershipAccessFromPaymentLink(
  reference: string,
  source: string,
) {
  const normalizedReference = reference.trim().toUpperCase();
  if (!/^AFM-[A-Z0-9-]{4,}$/i.test(normalizedReference)) {
    return { synced: false, reason: 'invalid-reference' };
  }

  const access = await getMembershipAccess(normalizedReference);
  if (!access?.payment_url) {
    return { synced: false, reason: 'payment-link-missing' };
  }

  if (access.status === 'paid' && access.paid_message_sent_at) {
    return { synced: false, reason: 'already-synced' };
  }

  const fullyPaid = await isSingapayPaymentLinkFullyPaid(access.payment_url).catch(
    () => false,
  );
  if (!fullyPaid) return { synced: false, reason: 'not-paid' };

  let paidMessageSentAt: string | undefined;
  if (access.whatsapp_phone && !access.paid_message_sent_at) {
    await sendPaidAccessMessage({
      phone: access.whatsapp_phone,
      reference: normalizedReference,
    });
    paidMessageSentAt = new Date().toISOString();
  }

  await markMembershipAccessPaid({
    reference: normalizedReference,
    paid_message_sent_at: paidMessageSentAt,
    raw_payload: {
      source,
      checked_at: new Date().toISOString(),
      payment_link_status: 'fully_paid',
    },
  });
  await creditAndNotifyAffiliate(normalizedReference);

  return { synced: true, paidMessageSentAt };
}
