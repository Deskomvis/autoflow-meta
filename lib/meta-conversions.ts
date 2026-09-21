import { createHash } from 'node:crypto';

const DEFAULT_PIXEL_ID = '651322600748290';
const DEFAULT_GRAPH_API_VERSION = 'v23.0';

type MetaEventName = 'InitiateCheckout' | 'Purchase';

type SendMetaEventInput = {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  value: number;
  clientIpAddress?: string;
  clientUserAgent?: string;
  phone?: string;
  fbc?: string;
  fbp?: string;
};

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined
  );
}

export async function sendMetaConversion(input: SendMetaEventInput) {
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!accessToken) {
    return { sent: false as const, reason: 'not-configured' as const };
  }

  const phone = input.phone ? normalizePhone(input.phone) : '';
  const userData = {
    ...(phone ? { ph: [sha256(phone)] } : {}),
    ...(input.clientIpAddress
      ? { client_ip_address: input.clientIpAddress }
      : {}),
    ...(input.clientUserAgent
      ? { client_user_agent: input.clientUserAgent }
      : {}),
    ...(input.fbc ? { fbc: input.fbc } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
  };
  const apiVersion =
    process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${pixelId}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: input.eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: input.eventId,
            event_source_url: input.eventSourceUrl,
            action_source: 'website',
            user_data: userData,
            custom_data: {
              currency: 'IDR',
              value: input.value,
              content_name: 'Auto Flow Meta Ads dengan Claude AI',
              content_type: 'product',
              content_ids: ['autoflow-meta'],
              num_items: 1,
            },
          },
        ],
        access_token: accessToken,
      }),
      cache: 'no-store',
    },
  );

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn(
      'meta-conversion-failed',
      JSON.stringify({ eventName: input.eventName, status: response.status }),
    );
    return { sent: false as const, reason: 'api-error' as const, body };
  }

  return { sent: true as const, body };
}
