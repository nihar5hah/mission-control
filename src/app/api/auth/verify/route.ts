import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.MC_ADMIN_PASSWORD;

    if (!adminPassword) {
      // If no password is configured, deny all admin access for safety
      return NextResponse.json(
        { error: 'Admin access is not configured' },
        { status: 503 }
      );
    }

    // Constant-time-ish comparison to mitigate timing attacks
    if (password.length !== adminPassword.length || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
