import { NextResponse } from 'next/server';
import { getAffiliateProfile, serializeAffiliateProfile } from '@/lib/affiliate';
import { getMembershipAccess, isMembershipReferencePaid } from '@/lib/membership-access';

export const runtime = 'nodejs';

type ProfileRequest = {
  reference?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ProfileRequest | null;
  const reference = body?.reference?.trim().toUpperCase() ?? '';

  if (!reference || (await isMembershipReferencePaid(reference)) !== true) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [access, profile] = await Promise.all([
    getMembershipAccess(reference),
    getAffiliateProfile(reference),
  ]);

  return NextResponse.json({
    ok: true,
    ...serializeAffiliateProfile(profile, access?.whatsapp_phone ?? null),
  });
}
