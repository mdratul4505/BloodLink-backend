import type { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API endpoint not found!",
    errors: [
      {
        field: req.originalUrl,
        message: "The requested route does not exist on this server.",
      },
    ],
  });
};

export default notFound;
