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

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = req.headers.authorization;
      if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

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
      } catch (err) {
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

export default auth;
