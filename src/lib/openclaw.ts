type SendSessionMessageParams = {
  sessionKey: string;
  message: string;
  timeoutSeconds?: number;
};

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'http://localhost:3001';
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY;

export async function sendSessionMessage({
  sessionKey,
  message,
  timeoutSeconds = 0,
}: SendSessionMessageParams) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (OPENCLAW_API_KEY) headers['x-api-key'] = OPENCLAW_API_KEY;

  const response = await fetch(`${OPENCLAW_API_URL}/api/sessions/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionKey,
      message,
      timeoutSeconds,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenClaw request failed (${response.status}): ${text}`);
  }

  return response.json().catch(() => ({}));
}
