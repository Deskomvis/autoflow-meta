import { NextResponse } from 'next/server';
import { getCourseVotes, voteForCourse } from '@/lib/course-votes';
import { isMembershipReferencePaid } from '@/lib/membership-access';

export const runtime = 'nodejs';

type VoteRequest = {
  reference?: string;
  courseId?: string;
};

function normalizeReference(reference?: string) {
  return reference?.trim().toUpperCase() ?? '';
}

async function isAllowed(reference: string) {
  return Boolean(reference) && (await isMembershipReferencePaid(reference)) === true;
}

export async function GET(request: Request) {
  const reference = normalizeReference(new URL(request.url).searchParams.get('reference') ?? '');

  if (!(await isAllowed(reference))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, ...(await getCourseVotes(reference)) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as VoteRequest | null;
  const reference = normalizeReference(body?.reference);
  const courseId = body?.courseId?.trim() ?? '';

  if (!(await isAllowed(reference))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await voteForCourse({ reference, courseId });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    alreadyVoted: result.alreadyVoted,
    ...result.snapshot,
  });
}
