import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { normalizeCode, resolveAffiliateByCode } from '@/lib/affiliate';
import { AFFILIATE_DISCOUNT_RATE, applyAffiliateDiscount, BASE_PRICE } from '@/lib/pricing';

export const runtime = 'nodejs';

export async function GET() {
  const jar = await cookies();
  const code = normalizeCode(jar.get('afm_aff')?.value ?? '');
  const affiliate = code ? await resolveAffiliateByCode(code) : null;
  const pricing = applyAffiliateDiscount();

  return NextResponse.json({
    active: Boolean(affiliate),
    code: affiliate?.affiliate_code ?? null,
    basePrice: BASE_PRICE,
    discountedPrice: pricing.finalAmount,
    discountAmount: pricing.discountAmount,
    discountRate: AFFILIATE_DISCOUNT_RATE,
  });
}
