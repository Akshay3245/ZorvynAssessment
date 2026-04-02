import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { transactionApi, TransactionPayload } from "../api/transactionApi";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { TransactionFormModal } from "../components/transactions/TransactionFormModal";
import { TransactionsTable } from "../components/transactions/TransactionsTable";
import { useAuth } from "../hooks/useAuth";
import { Transaction, TransactionFilters } from "../types";

const DEFAULT_LIMIT = 10;

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ANALYST";
  const showOwner = user?.role === "ADMIN";

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: DEFAULT_LIMIT
  });
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionApi.list(filters)
  });

  const createMutation = useMutation({
    mutationFn: transactionApi.create,
    onSuccess: async () => {
      setModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      if (isAxiosError<{ message?: string }>(mutationError)) {
        setError(mutationError.response?.data?.message || "Failed to create transaction.");
      } else {
        setError("Failed to create transaction.");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TransactionPayload> }) => transactionApi.update(id, payload),
    onSuccess: async () => {
      setModalOpen(false);
      setEditingTransaction(null);
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      if (isAxiosError<{ message?: string }>(mutationError)) {
        setError(mutationError.response?.data?.message || "Failed to update transaction.");
      } else {
        setError("Failed to update transaction.");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: transactionApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      if (isAxiosError<{ message?: string }>(mutationError)) {
        setError(mutationError.response?.data?.message || "Failed to delete transaction.");
      } else {
        setError("Failed to delete transaction.");
      }
    }
  });

  const pagination = useMemo(
    () => ({
      current: filters.page || 1,
      totalPages: transactionsQuery.data?.meta.totalPages || 1
    }),
    [filters.page, transactionsQuery.data?.meta.totalPages]
  );

  const openCreateModal = () => {
    setError(null);
    setModalMode("create");
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setError(null);
    setModalMode("edit");
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = (payload: TransactionPayload) => {
    setError(null);

    if (modalMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, payload });
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    setError(null);
    deleteMutation.mutate(id);
  };

  if (transactionsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (transactionsQuery.isError || !transactionsQuery.data) {
    return <ErrorState message="Unable to load transactions." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Type</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              value={filters.type || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  type: (event.target.value || undefined) as "INCOME" | "EXPENSE" | undefined
                }))
              }
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Category</span>
            <input
              type="text"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={filters.category || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  category: event.target.value || undefined
                }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Start Date</span>
            <input
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={filters.startDate || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  startDate: event.target.value || undefined
                }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">End Date</span>
            <input
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={filters.endDate || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  endDate: event.target.value || undefined
                }))
              }
            />
          </label>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Add Transaction
          </button>
        ) : null}
      </div>

      {error ? <ErrorState message={error} /> : null}

      <TransactionsTable
        transactions={transactionsQuery.data.data}
        canManage={Boolean(canManage)}
        showOwner={showOwner}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
        <p className="text-sm text-slate-600">
          Page {pagination.current} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.current <= 1}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page || 1) - 1
              }))
            }
            className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.current >= pagination.totalPages}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page || 1) + 1
              }))
            }
            className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <TransactionFormModal
        open={modalOpen}
        mode={modalMode}
        initialTransaction={editingTransaction}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
