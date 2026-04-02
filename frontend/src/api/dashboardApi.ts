import { api } from "../lib/axios";
import { CategoryTotal, DashboardSummary, MonthlyTrend, Transaction } from "../types";

type ApiResponse<T> = {
  message: string;
  data: T;
};

export const dashboardApi = {
  async summary() {
    const response = await api.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return response.data.data;
  },

  async categoryTotals(type?: "INCOME" | "EXPENSE") {
    const response = await api.get<ApiResponse<CategoryTotal[]>>("/dashboard/categories", {
      params: { type }
    });
    return response.data.data;
  },

  async monthlyTrends(months = 6) {
    const response = await api.get<ApiResponse<MonthlyTrend[]>>("/dashboard/monthly-trends", {
      params: { months }
    });
    return response.data.data;
  },

  async recentTransactions(limit = 5) {
    const response = await api.get<ApiResponse<Transaction[]>>("/dashboard/recent-transactions", {
      params: { limit }
    });
    return response.data.data;
  }
};
