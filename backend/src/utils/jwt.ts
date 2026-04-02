import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload } from "../types/auth";

const signOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
};

export const generateToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, signOptions);

export const verifyToken = (token: string): AuthTokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
