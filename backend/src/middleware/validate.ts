import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny, location: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const requestData = req as unknown as Record<"body" | "query" | "params", unknown>;
    const result = schema.safeParse(requestData[location]);

    if (!result.success) {
      return next(result.error);
    }

    requestData[location] = result.data;
    return next();
  };
