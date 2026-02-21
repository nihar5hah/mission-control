const BASE_URL = process.env.MISSION_CONTROL_BASE_URL || 'https://mission-control-one-gold.vercel.app';
const API_KEY = process.env.MC_API_KEY;
const AGENT_ID = process.env.AGENT_ID || 'coder';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${response.status} ${text}`);
  }
  return response.json();
}

async function autoClaim() {
  const health = await fetchJson(`${BASE_URL}/api/agents/health`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  const agent = health.agents.find((a) => a.agent_id === AGENT_ID);
  if (!agent) {
    console.log(`No health data for ${AGENT_ID}`);
    return;
  }

  if (agent.health_score >= 60 && agent.utilization_score >= 50) {
    console.log(`Agent ${AGENT_ID} is healthy; skipping auto-claim.`);
    return;
  }

  const claimable = await fetchJson(`${BASE_URL}/api/tasks-board/claimable?agent_id=${AGENT_ID}`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  const candidates = (claimable.tasks || []).sort((a, b) => b.match_score - a.match_score);
  if (candidates.length === 0) {
    console.log('No claimable tasks found.');
    return;
  }

  const task = candidates[0];
  const claim = await fetchJson(`${BASE_URL}/api/tasks-board/${task.id}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: JSON.stringify({
      agent_id: AGENT_ID,
      reason: 'Auto-claiming due to underutilization',
    }),
  });

  console.log('Claimed task:', claim.task?.title);
}

autoClaim().catch((err) => {
  console.error('Auto-claim failed:', err.message);
  process.exit(1);
});
