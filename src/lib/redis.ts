import Redis from 'ioredis';

/**
 * Redis client using ioredis library
 * Connects using REDIS_URL from environment
 */

let redis: Redis;

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set');
}

redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export { redis };

/**
 * Helper function to check if Redis is accessible.
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
