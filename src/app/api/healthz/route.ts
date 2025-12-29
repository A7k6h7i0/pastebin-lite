import { NextRequest, NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis';

/**
 * GET /api/healthz
 * 
 * Health check endpoint that verifies:
 * - The server is running
 * - Redis/KV is accessible
 * 
 * Required by automated tests.
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Redis is accessible
    const isHealthy = await checkRedisHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { ok: false, error: 'Redis unavailable' },
        { status: 503 }
      );
    }
    
    // Everything is good
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
