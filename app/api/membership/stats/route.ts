import { NextResponse } from 'next/server';
import { getPaidMembershipAccessCount } from '@/lib/membership-access';

export const runtime = 'nodejs';

const initialEarlybirdTaken = 12;
const earlybirdLimit = 30;

export async function GET() {
  const paidCount = await getPaidMembershipAccessCount();
  const taken = Math.min(earlybirdLimit, initialEarlybirdTaken + (paidCount ?? 0));
  const remaining = Math.max(0, earlybirdLimit - taken);

  return NextResponse.json({
    limit: earlybirdLimit,
    taken,
    remaining,
  });
}
