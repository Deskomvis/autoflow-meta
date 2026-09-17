import { NextResponse } from 'next/server';
import { getPaidMembershipAccessCount } from '@/lib/membership-access';
import {
  EARLYBIRD_RELEASED_SLOTS,
  getCurrentPricingTier,
  RESERVED_RESELLER_SLOTS,
} from '@/lib/pricing';

export const runtime = 'nodejs';

export async function GET() {
  const paidCount = await getPaidMembershipAccessCount();
  const tier = getCurrentPricingTier(paidCount ?? 0);

  return NextResponse.json({
    tier: tier.id,
    label: tier.label,
    badge: tier.badge,
    price: tier.price,
    limit: tier.limit,
    taken: tier.taken,
    remaining: tier.remaining,
    totalTaken: tier.totalTaken,
    reservedSlots: RESERVED_RESELLER_SLOTS,
    earlybirdSoldOut: true,
    earlybirdReleasedSlots: EARLYBIRD_RELEASED_SLOTS,
    paidCount: paidCount ?? 0,
  });
}
