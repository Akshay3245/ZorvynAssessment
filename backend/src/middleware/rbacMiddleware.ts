import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const authorizeRoles = (...allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }

  return next();
};
