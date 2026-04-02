import { Role } from "@prisma/client";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: Role;
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
