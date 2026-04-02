import { Transaction } from "../../types";

type TransactionsTableProps = {
  transactions: Transaction[];
  canManage: boolean;
  showOwner?: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const TransactionsTable = ({ transactions, canManage, showOwner = false, onEdit, onDelete }: TransactionsTableProps) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="px-4 py-3">Date</th>
          {showOwner ? <th className="px-4 py-3">User</th> : null}
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Amount</th>
          <th className="px-4 py-3">Note</th>
          {canManage ? <th className="px-4 py-3">Actions</th> : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td className="px-4 py-3">{formatDate(transaction.date)}</td>
            {showOwner ? (
              <td className="px-4 py-3">
                <div className="min-w-[170px]">
                  <p className="font-medium text-slate-700">{transaction.owner?.name || "Unknown User"}</p>
                  <p className="text-xs text-slate-500">{transaction.owner?.email || transaction.userId}</p>
                </div>
              </td>
            ) : null}
            <td className="px-4 py-3">
              <span
                className={[
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  transaction.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                ].join(" ")}
              >
                {transaction.type}
              </span>
            </td>
            <td className="px-4 py-3">{transaction.category}</td>
            <td className="px-4 py-3 font-semibold">{formatCurrency(transaction.amount)}</td>
            <td className="max-w-xs truncate px-4 py-3">{transaction.note || "-"}</td>
            {canManage ? (
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(transaction.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
