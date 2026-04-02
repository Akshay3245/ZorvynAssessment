import { Request, Response } from "express";
import {
  CategoryTotalsQueryInput,
  MonthlyTrendQueryInput,
  RecentTransactionsQueryInput
} from "../schemas/dashboardSchemas";
import { dashboardService } from "../services/dashboardService";
import { getRequestUser } from "../utils/requestUser";

export const dashboardController = {
  async summary(req: Request, res: Response) {
    const user = getRequestUser(req);
    const data = await dashboardService.summary(user);

    return res.status(200).json({
      message: "Dashboard summary fetched successfully",
      data
    });
  },

  async categoryTotals(req: Request, res: Response) {
    const user = getRequestUser(req);
    const query = req.query as unknown as CategoryTotalsQueryInput;
    const data = await dashboardService.categoryTotals(user, query);

    return res.status(200).json({
      message: "Category totals fetched successfully",
      data
    });
  },

  async monthlyTrends(req: Request, res: Response) {
    const user = getRequestUser(req);
    const query = req.query as unknown as MonthlyTrendQueryInput;
    const data = await dashboardService.monthlyTrends(user, query.months);

    return res.status(200).json({
      message: "Monthly trends fetched successfully",
      data
    });
  },

  async recentTransactions(req: Request, res: Response) {
    const user = getRequestUser(req);
    const query = req.query as unknown as RecentTransactionsQueryInput;
    const data = await dashboardService.recentTransactions(user, query.limit);

    return res.status(200).json({
      message: "Recent transactions fetched successfully",
      data
    });
  }
};
