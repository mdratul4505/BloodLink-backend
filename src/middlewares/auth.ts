import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config/index.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

export interface IAuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}

const extractToken = (req: Request): string | null => {
  let token = req.headers.authorization;
  if (token) {
    token = token.trim();
    // Strip wrapping quotes if any
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1).trim();
    }
    // Remove repeated 'Bearer' prefixes (e.g., 'Bearer Bearer ...')
    while (/^bearer\s+/i.test(token)) {
      token = token.replace(/^bearer\s+/i, "").trim();
    }
    return token.length > 0 ? token : null;
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // Check if token is blacklisted
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Token has been invalidated. Please log in again.",
        );
      }

      // Verify token
      let decoded: any;
      try {
        decoded = verifyToken(token, config.jwt.access_secret);
      } catch (err: any) {
        // Did the user pass a refresh token by mistake?
        try {
          verifyToken(token, config.jwt.refresh_secret);
          throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You provided a Refresh Token instead of an Access Token! Please use the 'accessToken' in the Authorization header.",
          );
        } catch (innerErr) {
          if (innerErr instanceof AppError) {
            throw innerErr;
          }
        }

        if (err?.name === "TokenExpiredError") {
          throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Your access token has expired. Please log in again to get a fresh token.",
          );
        }

        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token!");
      }

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
      }

      if (user.deletedAt) {
        throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted!");
      }

      if (user.status === "SUSPENDED") {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Your account is currently suspended. Please contact support.",
        );
      }

      // Check role authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource!",
        );
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const blacklisted = await isTokenBlacklisted(token);
      if (!blacklisted) {
        const decoded = verifyToken(token, config.jwt.access_secret) as IAuthUser;
        req.user = decoded;
      }
    }
  } catch {
    // Continue without user if token is invalid
  }
  next();
};

export default auth;

