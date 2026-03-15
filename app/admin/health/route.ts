import { NextRequest, NextResponse } from 'next/server';

// GET /admin/health
// Protected by HEALTH_CHECK_SECRET header.
// Returns current deployment version, environment, and timestamp.
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-health-secret');

  if (!secret || secret !== process.env.HEALTH_CHECK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'ok',
    environment: process.env.NEXT_PUBLIC_ENV ?? 'unknown',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
