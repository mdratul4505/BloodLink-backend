import { Redis } from "ioredis";
import config from "./index.js";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts
      }
      return 1000;
    },
  });

  redisClient.on("connect", () => {
    isRedisAvailable = true;
    console.log("Redis connected successfully.");
  });

  redisClient.on("error", (err) => {
    isRedisAvailable = false;
    // Suppress repeated connection logs in dev
  });
} catch (error) {
  isRedisAvailable = false;
  redisClient = null;
}

export const connectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.connect();
      isRedisAvailable = true;
    } catch {
      isRedisAvailable = false;
      console.warn("Redis connection failed. Running with in-memory fallback.");
    }
  }
};

export const getRedisClient = (): Redis | null => {
  return isRedisAvailable ? redisClient : null;
};

export { isRedisAvailable, redisClient };
export default redisClient;
