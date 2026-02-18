import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({ success: true, refreshed: true });
  } catch (error) {
    console.error('[QuickActions] Refresh activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
