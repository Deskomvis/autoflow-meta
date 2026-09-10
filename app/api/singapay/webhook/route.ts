import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  getMembershipAccess,
  markMembershipAccessPaid,
} from '@/lib/membership-access';
import { sendPaidAccessMessage } from '@/lib/roketchat';

export const runtime = 'nodejs';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortJson(entry)]),
    );
  }
  return value;
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifySignature(request: Request, body: JsonValue) {
  const secret =
    process.env.SINGAPAY_HMAC_VALIDATION_KEY ||
    process.env.SINGAPAY_CLIENT_SECRET;
  const signature = request.headers.get('x-signature');
  const timestamp = request.headers.get('x-timestamp');
  const authorization = request.headers.get('authorization') || '';
  const callbackToken = authorization.replace(/^Bearer\s+/i, '');

  if (!secret) {
    return 'skipped';
  }

  if (!signature || !timestamp || !callbackToken) {
    return 'invalid';
  }

  const endpoint = new URL(request.url).pathname;
  const normalizedBody = JSON.stringify(sortJson(body));
  const bodyHash = createHash('sha256').update(normalizedBody).digest('hex');
  const stringToSign = [
    request.method.toUpperCase(),
    endpoint,
    callbackToken,
    bodyHash,
    timestamp,
  ].join(':');
  const expected = createHmac('sha512', secret)
    .update(stringToSign)
    .digest('hex');

  return safeEqualHex(expected, signature) ? 'valid' : 'invalid';
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function extractPaymentFields(body: JsonValue) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {};
  }

  const data = body.data;
  const dataObject =
    data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const reference =
    readString(body.reff_no) ||
    readString(body.merchant_reff_no) ||
    readString(body.reference) ||
    readString(body.payment_link_reff_no) ||
    readString(dataObject.reff_no) ||
    readString(dataObject.merchant_reff_no) ||
    readString(dataObject.reference) ||
    readString(dataObject.payment_link_reff_no);
  const status =
    readString(body.status) ||
    readString(body.transaction_status) ||
    readString(dataObject.status) ||
    readString(dataObject.transaction_status);
  const transactionId =
    readString(body.transaction_id) || readString(dataObject.transaction_id);

  return { reference, status, transactionId };
}

export async function POST(request: Request) {
  let body: JsonValue = null;

  try {
    body = (await request.json()) as JsonValue;
  } catch {
    body = null;
  }

  const signature = verifySignature(request, body);
  console.info(
    'singapay-webhook',
    JSON.stringify({
      signature,
      event:
        body && typeof body === 'object' && !Array.isArray(body)
          ? body.event
          : undefined,
      status:
        body && typeof body === 'object' && !Array.isArray(body)
          ? body.status
          : undefined,
    }),
  );

  if (signature === 'invalid') {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = extractPaymentFields(body);
  if (
    payment.reference &&
    payment.status &&
    ['paid', 'success', 'completed', 'settled'].includes(
      payment.status.toLowerCase(),
    )
  ) {
    const reference = payment.reference.toUpperCase();
    const access = await getMembershipAccess(reference);
    let paidMessageSentAt: string | undefined;

    if (access?.whatsapp_phone && !access.paid_message_sent_at) {
      try {
        await sendPaidAccessMessage({
          phone: access.whatsapp_phone,
          reference,
        });
        paidMessageSentAt = new Date().toISOString();
      } catch (error) {
        console.warn(
          'roketchat-paid-message-failed',
          JSON.stringify({
            reference,
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        );
      }
    }

    await markMembershipAccessPaid({
      reference,
      singapay_transaction_id: payment.transactionId,
      paid_message_sent_at: paidMessageSentAt,
      raw_payload: body,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'singapay-webhook',
  });
}
