export const ROLES = {
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  VIEWER: "VIEWER"
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];
