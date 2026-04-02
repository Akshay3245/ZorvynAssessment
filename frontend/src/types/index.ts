export type Role = "ADMIN" | "ANALYST" | "VIEWER";
export type TransactionType = "INCOME" | "EXPENSE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string | null;
  userId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  createdAt: string;
  updatedAt: string;
};

export type PaginatedTransactions = {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TransactionFilters = {
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
};

export type CategoryTotal = {
  category: string;
  total: number;
  count: number;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expense: number;
  net: number;
};
