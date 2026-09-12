export const INITIAL_PAID_SLOTS = 7;

export const PRICING_TIERS = [
  {
    id: 'earlybird',
    label: 'Earlybird',
    badge: 'Harga earlybird',
    price: 497_000,
    limit: 50,
  },
  {
    id: 'regular',
    label: 'Reguler',
    badge: 'Harga reguler',
    price: 697_000,
    limit: 50,
  },
  {
    id: 'extended',
    label: 'Extended',
    badge: 'Harga extended',
    price: 997_000,
    limit: null,
  },
] as const;

export const BASE_PRICE = PRICING_TIERS[0].price;

// Downline (buyer via an affiliate) gets this off the base price.
export const AFFILIATE_DISCOUNT_RATE = 0.15;

// Affiliator earns this share of the *base* price on every referred sale,
// regardless of the discount the downline received.
export const AFFILIATE_COMMISSION_RATE = 0.25;

export function applyAffiliateDiscount(base: number = BASE_PRICE) {
  const discountAmount = Math.round(base * AFFILIATE_DISCOUNT_RATE);
  return { base, discountAmount, finalAmount: base - discountAmount };
}

export function affiliateCommission(base: number = BASE_PRICE) {
  return Math.round(base * AFFILIATE_COMMISSION_RATE);
}

export function getCurrentPricingTier(paidCount = 0) {
  const totalTaken = INITIAL_PAID_SLOTS + Math.max(0, paidCount);
  let consumedBeforeTier = 0;

  for (const tier of PRICING_TIERS) {
    if (tier.limit === null) {
      return {
        ...tier,
        taken: Math.max(0, totalTaken - consumedBeforeTier),
        remaining: null,
        totalTaken,
      };
    }

    if (totalTaken < consumedBeforeTier + tier.limit) {
      return {
        ...tier,
        taken: Math.max(0, totalTaken - consumedBeforeTier),
        remaining: consumedBeforeTier + tier.limit - totalTaken,
        totalTaken,
      };
    }

    consumedBeforeTier += tier.limit;
  }

  const extended = PRICING_TIERS[PRICING_TIERS.length - 1];
  return {
    ...extended,
    taken: Math.max(0, totalTaken - consumedBeforeTier),
    remaining: null,
    totalTaken,
  };
}

export function formatIDR(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`;
}
