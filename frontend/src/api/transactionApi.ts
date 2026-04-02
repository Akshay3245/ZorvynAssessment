import { api } from "../lib/axios";
import { PaginatedTransactions, Transaction, TransactionFilters, TransactionType } from "../types";

type ApiResponse<T> = {
  message: string;
  data: T;
};

type ListResponse = {
  message: string;
  data: Transaction[];
  meta: PaginatedTransactions["meta"];
};

export type TransactionPayload = {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  userId?: string;
};

export const transactionApi = {
  async list(filters: TransactionFilters) {
    const response = await api.get<ListResponse>("/transactions", {
      params: filters
    });

    return {
      data: response.data.data,
      meta: response.data.meta
    } as PaginatedTransactions;
  },

  async create(payload: TransactionPayload) {
    const response = await api.post<ApiResponse<Transaction>>("/transactions", payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<TransactionPayload>) {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload);
    return response.data.data;
  },

  async remove(id: string) {
    await api.delete(`/transactions/${id}`);
  }
};
