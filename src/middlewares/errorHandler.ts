import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): void => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errors: Array<{ field?: string; message: string }> = [];

  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path[issue.path.length - 1]?.toString() || issue.path.join("."),
      message: issue.message,
    }));
  } else if (err?.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    message = "A resource with this unique value already exists";
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(", ")
      : (err.meta?.target as string) || "field";
    errors = [
      {
        field: target,
        message: `Unique constraint violated on ${target}`,
      },
    ];
  } else if (err?.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = (err.meta?.cause as string) || "Record not found";
    errors = [{ message }];
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid or expired token";
    errors = [{ message: err.message }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = [{ message: err.message }];
  } else if (err instanceof Error) {
    message = err.message || message;
    errors = [{ message: err.message || message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
