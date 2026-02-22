import { NextResponse } from 'next/server';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const exec = promisify(execCb);
let lastHeartbeatAt: string | null = null;

async function safeExec(command: string) {
  try {
    const { stdout } = await exec(command, { timeout: 3000 });
    return stdout;
  } catch {
    return '';
  }
}

async function countProcesses(name: string) {
  const stdout = await safeExec(`pgrep -x ${name} | wc -l`);
  const count = Number.parseInt(stdout.trim(), 10);
  return Number.isFinite(count) ? count : 0;
}

async function checkPortBound(port: number) {
  const stdout = await safeExec('ss -ltn');
  if (!stdout) return false;
  return stdout.split('\n').some((line) => line.includes(`:${port} `) || line.includes(`:${port}\n`) || line.endsWith(`:${port}`));
}

async function probeGatewayHeartbeat() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch('http://127.0.0.1:18789/', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok || res.status) {
      lastHeartbeatAt = new Date().toISOString();
      return true;
    }
  } catch {
    clearTimeout(timeout);
  }
  return false;
}

export async function GET() {
  try {
    const [openclawCount, gatewayCount, portBound, heartbeatOk] = await Promise.all([
      countProcesses('openclaw'),
      countProcesses('openclaw-gateway'),
      checkPortBound(18789),
      probeGatewayHeartbeat(),
    ]);

    const processCount = openclawCount + gatewayCount;
    const checkedAt = new Date().toISOString();

    return NextResponse.json({
      processCount,
      openclawCount,
      gatewayCount,
      port: 18789,
      portBound,
      lastHeartbeatAt,
      heartbeatOk,
      checkedAt,
    });
  } catch (error) {
    console.error('[GatewayHealth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
