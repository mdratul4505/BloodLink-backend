import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { getRedisClient } from "../config/redis.js";
import AppError from "../utils/AppError.js";

const memoryLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
  message?: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const key = `rl:${options.keyPrefix}:${String(ip).split(",")[0]?.trim()}`;

    try {
      const redis = getRedisClient();
      if (redis) {
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, options.windowSeconds);
        }

        if (current > options.maxRequests) {
          throw new AppError(
            httpStatus.TOO_MANY_REQUESTS,
            options.message || "Too many requests. Please try again later.",
          );
        }
        return next();
      }
    } catch (err) {
      if (err instanceof AppError) return next(err);
      // Redis error: fall through to memory limiter
    }

    // Memory limiter
    const now = Date.now();
    const entry = memoryLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      memoryLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowSeconds * 1000,
      });
      return next();
    }

    entry.count += 1;
    if (entry.count > options.maxRequests) {
      return next(
        new AppError(
          httpStatus.TOO_MANY_REQUESTS,
          options.message || "Too many requests. Please try again later.",
        ),
      );
    }

    next();
  };
};

export default rateLimiter;
