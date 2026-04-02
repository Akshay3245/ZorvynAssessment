import { FormEvent, useEffect, useState } from "react";
import { TransactionPayload } from "../../api/transactionApi";
import { Transaction } from "../../types";

type TransactionFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialTransaction?: Transaction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TransactionPayload) => void;
};

const getInitialFormValues = (transaction?: Transaction | null): TransactionPayload => ({
  amount: transaction?.amount ?? 0,
  type: transaction?.type ?? "EXPENSE",
  category: transaction?.category ?? "",
  date: transaction?.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  note: transaction?.note ?? ""
});

export const TransactionFormModal = ({
  open,
  mode,
  initialTransaction,
  isSubmitting,
  onClose,
  onSubmit
}: TransactionFormModalProps) => {
  const [formValues, setFormValues] = useState<TransactionPayload>(getInitialFormValues(initialTransaction));

  useEffect(() => {
    if (open) {
      setFormValues(getInitialFormValues(initialTransaction));
    }
  }, [initialTransaction, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{mode === "create" ? "Add Transaction" : "Edit Transaction"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
              value={formValues.amount}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  amount: Number(event.target.value)
                }))
              }
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Type</span>
              <select
                className="rounded-md border border-slate-300 px-3 py-2"
                value={formValues.type}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    type: event.target.value as "INCOME" | "EXPENSE"
                  }))
                }
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Date</span>
              <input
                type="date"
                required
                className="rounded-md border border-slate-300 px-3 py-2"
                value={formValues.date}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    date: event.target.value
                  }))
                }
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Category</span>
            <input
              type="text"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
              value={formValues.category}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  category: event.target.value
                }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Note</span>
            <textarea
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2"
              value={formValues.note}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  note: event.target.value
                }))
              }
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Transaction" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
