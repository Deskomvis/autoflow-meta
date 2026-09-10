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
