import { Redis, type RedisOptions } from "ioredis";
import config from "./index.js";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

const initRedis = (): Redis | null => {
  try {
    const options: RedisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Stop retrying after 2 attempts to avoid blocking
        }
        return 1000;
      },
    };

    if (config.redis.url) {
      redisClient = new Redis(config.redis.url, options);
    } else {
      redisClient = new Redis({
        ...options,
        host: config.redis.host,
        port: config.redis.port,
        username: config.redis.user,
        password: config.redis.password || undefined,
      });
    }

    redisClient.on("connect", () => {
      isRedisAvailable = true;
      console.log("Redis connected successfully.");
    });

    redisClient.on("ready", () => {
      isRedisAvailable = true;
    });

    redisClient.on("error", (err) => {
      isRedisAvailable = false;
      // Suppress noisy reconnection logs
    });

    redisClient.on("close", () => {
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    isRedisAvailable = false;
    redisClient = null;
    return null;
  }
};

initRedis();

export const connectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.connect();
      isRedisAvailable = true;
      console.log("Redis client connected successfully.");
    } catch (err: any) {
      isRedisAvailable = false;
      console.warn(
        `[Redis] Notice: Could not connect to Redis server (${err?.message || "connection error"}). ` +
          `The application is running safely with high-performance in-memory cache/OTP fallback.`,
      );
    }
  } else {
    console.warn(
      `[Redis] Notice: Redis client not initialized. Running with in-memory fallback.`,
    );
  }
};

export const getRedisClient = (): Redis | null => {
  return isRedisAvailable ? redisClient : null;
};

export { isRedisAvailable, redisClient };
export default redisClient;
