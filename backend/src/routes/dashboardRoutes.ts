import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  categoryTotalsQuerySchema,
  monthlyTrendQuerySchema,
  recentTransactionsQuerySchema
} from "../schemas/dashboardSchemas";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/summary", asyncHandler(dashboardController.summary));
router.get("/categories", validate(categoryTotalsQuerySchema, "query"), asyncHandler(dashboardController.categoryTotals));
router.get("/monthly-trends", validate(monthlyTrendQuerySchema, "query"), asyncHandler(dashboardController.monthlyTrends));
router.get(
  "/recent-transactions",
  validate(recentTransactionsQuerySchema, "query"),
  asyncHandler(dashboardController.recentTransactions)
);

export default router;
