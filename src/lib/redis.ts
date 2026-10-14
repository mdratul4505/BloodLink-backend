import redisClient, { connectRedis, getRedisClient, isRedisAvailable } from "../config/redis.js";

export { connectRedis, getRedisClient, isRedisAvailable, redisClient };
export default redisClient;
