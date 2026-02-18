import { NextRequest } from 'next/server';
import { requireApiKey } from '@/lib/auth';
import { POST as syncDocuments } from '../sync/route';

// POST /api/agents/documents/sync-all
export async function POST(request: NextRequest) {
  return syncDocuments(request);
}
