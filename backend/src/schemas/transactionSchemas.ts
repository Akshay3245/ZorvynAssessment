import { z } from "zod";

const transactionTypeSchema = z
  .enum(["income", "expense", "INCOME", "EXPENSE"])
  .transform((value) => value.toUpperCase() as "INCOME" | "EXPENSE");

const dateSchema = z
  .union([z.string(), z.date()])
  .transform((value) => new Date(value))
  .refine((date) => !Number.isNaN(date.getTime()), "Invalid date");

export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: transactionTypeSchema,
  category: z.string().trim().min(2, "Category is required"),
  date: dateSchema,
  note: z.string().trim().max(500, "Note can be max 500 chars").optional(),
  userId: z.string().trim().min(1).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  "At least one field is required to update"
);

export const transactionParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().trim().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  userId: z.string().trim().min(1).optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
