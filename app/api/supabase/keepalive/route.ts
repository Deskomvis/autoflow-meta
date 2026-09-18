import { NextResponse } from 'next/server';
import { requestSupabase } from '@/lib/membership-access';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.ROKETCHAT_ADMIN_SECRET;
  const authorization = request.headers.get('authorization') ?? '';
  const querySecret = new URL(request.url).searchParams.get('secret');

  return Boolean(secret) && (authorization === `Bearer ${secret}` || querySecret === secret);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = await requestSupabase('membership_access?select=reference', {
    method: 'HEAD',
    headers: {
      Prefer: 'count=exact',
    },
  });

  if (!response) {
    return NextResponse.json(
      { ok: false, error: 'supabase_not_configured' },
      { status: 503 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: 'supabase_keepalive_failed', status: response.status },
      { status: 502 },
    );
  }

  const contentRange = response.headers.get('content-range');
  const count = contentRange?.split('/').at(1) ?? null;

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    count,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
