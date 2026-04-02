import { Request } from "express";
import { AuthUser } from "../types/auth";
import { AppError } from "./appError";

export const getRequestUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  return req.user;
};
