import { getRedisClient } from "../config/redis.js";

// In-memory fallback cache with TTL
const memoryStore = new Map<string, { value: string; expiry: number }>();

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const redis = getRedisClient();
    if (redis) {
      const data = await redis.get(key);
      if (data) return JSON.parse(data) as T;
      return null;
    }
  } catch (err) {
    console.error("Redis get error, falling back to memory:", err);
  }

  // Memory fallback
  const item = memoryStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(item.value) as T;
};

export const setCache = async (
  key: string,
  value: any,
  ttlSeconds = 300,
): Promise<void> => {
  const serialized = JSON.stringify(value);
  try {
    const redis = getRedisClient();
    if (redis) {
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
      return;
    }
  } catch (err) {
    console.error("Redis set error, falling back to memory:", err);
  }

  // Memory fallback
  memoryStore.set(key, {
    value: serialized,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(key);
      return;
    }
  } catch (err) {
    console.error("Redis del error:", err);
  }
  memoryStore.delete(key);
};

export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    }
  } catch (err) {
    console.error("Redis pattern del error:", err);
  }

  // Memory fallback prefix match
  const prefix = pattern.replace("*", "");
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
};

export default {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
};
