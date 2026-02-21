const BASE_URL = process.env.MISSION_CONTROL_BASE_URL || 'https://mission-control-one-gold.vercel.app';
const API_KEY = process.env.MC_API_KEY;

async function syncSessions() {
  const response = await fetch(`${BASE_URL}/api/agents/sessions/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Sync failed: ${response.status} ${text}`);
  }

  const data = await response.json().catch(() => ({}));
  console.log('✅ Sync complete:', data);
}

syncSessions().catch((err) => {
  console.error('❌ Session sync failed:', err.message);
  process.exit(1);
});
