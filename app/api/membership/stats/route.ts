import { NextResponse } from 'next/server';
import { getPaidMembershipAccessCount } from '@/lib/membership-access';
import { getCurrentPricingTier } from '@/lib/pricing';

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
  });
}
