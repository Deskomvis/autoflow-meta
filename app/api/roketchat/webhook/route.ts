import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { sendRoketchatText } from '@/lib/roketchat';

export const runtime = 'nodejs';

type RoketchatWebhookPayload = {
  event?: string;
  from?: string;
  chat_id?: string;
  body?: string;
  waMessageId?: string;
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.ROKETCHAT_WEBHOOK_SECRET;

  if (!secret) return true;
  if (!signature) return false;

  const expected =
    'sha256=' + createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  return safeEqual(signature, expected);
}

function normalizePhone(jid?: string) {
  return jid?.split('@')[0]?.replace(/\D/g, '') ?? '';
}

function greetingMessage() {
  return (
    process.env.ROKETCHAT_GREETING_MESSAGE ??
    [
      'Halo, terima kasih sudah menghubungi Auto Flow Meta Ads.',
      'Pesan kamu sudah masuk. Jika ingin akses course, simpan kode referensi pembayaran dan buka dashboard membership setelah pembayaran selesai.',
    ].join('\n\n')
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = JSON.parse(rawBody || '{}') as RoketchatWebhookPayload;

  if (payload.event !== 'message') {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const phone = normalizePhone(payload.from ?? payload.chat_id);
  const incomingBody = payload.body?.trim();

  if (!phone || !incomingBody || incomingBody === '[media]') {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await sendRoketchatText(phone, greetingMessage());
    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.warn(
      'roketchat-webhook-send-failed',
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Unknown error',
        waMessageId: payload.waMessageId,
      }),
    );

    return NextResponse.json({ ok: false, sent: false }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'roketchat-webhook',
  });
}
