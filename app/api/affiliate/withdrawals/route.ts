import { NextResponse } from 'next/server';
import {
  getAffiliateByOwner,
  listWithdrawals,
  updateWithdrawalStatus,
  type WithdrawalStatus,
} from '@/lib/affiliate';
import { sendWithdrawalStatusMessage } from '@/lib/roketchat';

export const runtime = 'nodejs';

const STATUSES: WithdrawalStatus[] = ['pending', 'processing', 'done', 'rejected'];

function authorized(request: Request) {
  const secret = process.env.ROKETCHAT_ADMIN_SECRET;
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get('status');
  const status =
    requested && STATUSES.includes(requested as WithdrawalStatus)
      ? (requested as WithdrawalStatus)
      : 'pending';

  return NextResponse.json({ ok: true, withdrawals: await listWithdrawals(status) });
}

type UpdateRequest = {
  id?: string;
  status?: string;
  note?: string;
};

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UpdateRequest | null;
  const id = body?.id?.trim() ?? '';
  const status = body?.status as WithdrawalStatus | undefined;

  if (!id || !status || !STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }

  const result = await updateWithdrawalStatus({ id, status, note: body?.note });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.error === 'NOT_FOUND' ? 404 : 500 },
    );
  }

  if (status !== 'pending') {
    try {
      const affiliate = await getAffiliateByOwner(result.row.owner_reference);
      if (affiliate) {
        await sendWithdrawalStatusMessage({
          phone: affiliate.whatsapp_phone,
          amount: result.row.amount,
          status,
          note: result.row.note ?? undefined,
        });
      }
    } catch (error) {
      console.warn(
        'affiliate-withdraw-status-notify-failed',
        JSON.stringify({
          id,
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  }

  return NextResponse.json({ ok: true, withdrawal: result.row });
}
