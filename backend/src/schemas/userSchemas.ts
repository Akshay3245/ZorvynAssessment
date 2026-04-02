import { z } from "zod";

const roleSchema = z
  .enum(["admin", "analyst", "viewer", "ADMIN", "ANALYST", "VIEWER"])
  .transform((value) => value.toUpperCase() as "ADMIN" | "ANALYST" | "VIEWER");

const statusSchema = z
  .enum(["active", "inactive", "ACTIVE", "INACTIVE"])
  .transform((value) => value.toUpperCase() as "ACTIVE" | "INACTIVE");

export const userParamsSchema = z.object({
  id: z.string().trim().min(1, "User id is required")
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  search: z.string().trim().min(1).optional()
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: roleSchema.optional(),
  status: statusSchema.optional()
});

export const updateUserRoleSchema = z.object({
  role: roleSchema
});

export const updateUserStatusSchema = z.object({
  status: statusSchema
});

export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
