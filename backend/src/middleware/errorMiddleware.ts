import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map((entry) => ({
        field: entry.path.join("."),
        message: entry.message
      }))
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({
      message: "Unique constraint violation"
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      message: "Internal server error",
      error: env.NODE_ENV === "development" ? error.message : undefined
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
};
