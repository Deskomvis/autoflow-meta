export const RESERVED_RESELLER_SLOTS = 7;
export const EARLYBIRD_RELEASED_SLOTS = 50;
export const NORMAL_RELEASE_BASE_PAID_COUNT = 36;

export const PRICING_TIERS = [
  {
    id: 'earlybird',
    label: 'Earlybird',
    badge: 'Sold out',
    price: 497_000,
    limit: 50,
  },
  {
    id: 'regular',
    label: 'Release/Normal',
    badge: 'Harga release/normal',
    price: 697_000,
    limit: 50,
  },
  {
    id: 'extended',
    label: 'Extended',
    badge: 'Harga extended',
    price: 997_000,
    limit: 100,
  },
] as const;

export const BASE_PRICE = PRICING_TIERS[1].price;

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
  const paidAfterNormalRelease = Math.max(0, paidCount - NORMAL_RELEASE_BASE_PAID_COUNT);
  const totalTaken = EARLYBIRD_RELEASED_SLOTS + paidAfterNormalRelease;
  let consumedBeforeTier = 0;

  for (const tier of PRICING_TIERS) {
    if (tier.id === 'earlybird') {
      consumedBeforeTier += tier.limit;
      continue;
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

  const extended = PRICING_TIERS.at(-1)!;
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
