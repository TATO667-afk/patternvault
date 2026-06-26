import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
  });

  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Redis] Connection error:", err.message);
    }
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ─── Cache Helpers ────────────────────────────────────────────────────────────

export const CacheTTL = {
  SHORT: 60,          // 1 min – live prices
  MEDIUM: 300,        // 5 min – market compare results
  LONG: 3600,         // 1 hour – skin metadata
  DAY: 86400,         // 24 hours – price history
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Swallow cache errors – never block the main path
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {}
}

export function buildCacheKey(...parts: string[]): string {
  return parts.join(":");
}

export default redis;
