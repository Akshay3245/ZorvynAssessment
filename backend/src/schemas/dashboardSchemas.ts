import { z } from "zod";

const transactionTypeSchema = z
  .enum(["income", "expense", "INCOME", "EXPENSE"])
  .transform((value) => value.toUpperCase() as "INCOME" | "EXPENSE");

export const categoryTotalsQuerySchema = z.object({
  type: transactionTypeSchema.optional()
});

export const monthlyTrendQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional()
});

export const recentTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional()
});

export type CategoryTotalsQueryInput = z.infer<typeof categoryTotalsQuerySchema>;
export type MonthlyTrendQueryInput = z.infer<typeof monthlyTrendQuerySchema>;
export type RecentTransactionsQueryInput = z.infer<typeof recentTransactionsQuerySchema>;
