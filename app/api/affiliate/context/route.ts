import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { normalizeCode, resolveAffiliateByCode } from '@/lib/affiliate';
import { getPaidMembershipAccessCount } from '@/lib/membership-access';
import {
  AFFILIATE_DISCOUNT_RATE,
  applyAffiliateDiscount,
  getCurrentPricingTier,
} from '@/lib/pricing';

export const runtime = 'nodejs';

export async function GET() {
  const jar = await cookies();
  const code = normalizeCode(jar.get('afm_aff')?.value ?? '');
  const affiliate = code ? await resolveAffiliateByCode(code) : null;
  const paidCount = await getPaidMembershipAccessCount();
  const activeTier = getCurrentPricingTier(paidCount ?? 0);
  const pricing = applyAffiliateDiscount(activeTier.price);

  return NextResponse.json({
    active: Boolean(affiliate),
    code: affiliate?.affiliate_code ?? null,
    basePrice: activeTier.price,
    discountedPrice: pricing.finalAmount,
    discountAmount: pricing.discountAmount,
    discountRate: AFFILIATE_DISCOUNT_RATE,
  });
}
