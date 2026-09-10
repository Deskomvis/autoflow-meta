export const BASE_PRICE = 497_000;

// Downline (buyer via an affiliate) gets this off the base price.
export const AFFILIATE_DISCOUNT_RATE = 0.15;

// Affiliator earns this share of the *base* price on every referred sale,
// regardless of the discount the downline received.
export const AFFILIATE_COMMISSION_RATE = 0.25;

export function applyAffiliateDiscount(base = BASE_PRICE) {
  const discountAmount = Math.round(base * AFFILIATE_DISCOUNT_RATE);
  return { base, discountAmount, finalAmount: base - discountAmount };
}

export function affiliateCommission(base = BASE_PRICE) {
  return Math.round(base * AFFILIATE_COMMISSION_RATE);
}

export function formatIDR(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`;
}
