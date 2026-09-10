type RoketchatTextResponse = {
  success?: boolean;
  code?: number;
  error?: string;
};

function getMessagesBaseUrl() {
  return (
    process.env.ROKETCHAT_MESSAGES_BASE_URL?.replace(/\/+$/, '') ??
    'https://roketchat.com/api/v1/messages'
  );
}

export function getRoketchatToken() {
  return process.env.ROKETCHAT_API_KEY ?? process.env.ROKETCHAT_TOKEN ?? '';
}

export function normalizeWhatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;

  return digits;
}

export async function sendRoketchatText(phone: string, body: string) {
  const token = getRoketchatToken();

  if (!token) {
    throw new Error('ROKETCHAT_API_KEY is not configured');
  }

  const response = await fetch(`${getMessagesBaseUrl()}/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify({ phone, body }),
    cache: 'no-store',
  });

  const payload = (await response
    .json()
    .catch(() => null)) as RoketchatTextResponse | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error ?? 'Roketchat message failed');
  }

  return payload;
}

export async function sendCheckoutGreeting(input: {
  phone: string;
  paymentUrl: string;
}) {
  const message = [
    'Halohai! 🔥🔥',
    'Thxyu udah checkout *Auto Flow Meta Ads - Methode Baru saya.*',
    'Monggo, tinggal transfer kesini:',
    input.paymentUrl,
    'ntar dapet kode referal untuk akses halaman membership.',
    'Tinggal klak klik > Nonton video panduan > Set n forget iklanmu > Delegasikan = Auto senyum kemudian 🥳',
    'Toss! 🙏',
  ].join('\n\n');

  return sendRoketchatText(input.phone, message);
}

export async function sendPaidAccessMessage(input: {
  phone: string;
  reference: string;
}) {
  const membershipUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ??
    process.env.SITE_URL?.replace(/\/+$/, '') ??
    process.env.APP_URL?.replace(/\/+$/, '') ??
    'https://autoflow.roketmedia.id';
  const message = [
    'Jhazakallah khair, matursuwun.',
    `Aksess Video & Download modul disini ya: ${membershipUrl}/membership`,
    `trus masukin kode referalmu : ${input.reference}`,
  ].join('\n\n');

  return sendRoketchatText(input.phone, message);
}
