import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validateRequest = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined && req.query) {
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params !== undefined && req.params) {
        Object.assign(req.params, parsed.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
