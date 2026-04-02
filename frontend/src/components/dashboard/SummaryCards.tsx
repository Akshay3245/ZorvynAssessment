import { DashboardSummary } from "../../types";

type SummaryCardsProps = {
  summary: DashboardSummary;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const cards = [
    {
      label: "Total Income",
      value: summary.totalIncome,
      className: "border-green-100 bg-green-50 text-green-800"
    },
    {
      label: "Total Expense",
      value: summary.totalExpense,
      className: "border-red-100 bg-red-50 text-red-800"
    },
    {
      label: "Net Balance",
      value: summary.netBalance,
      className: "border-brand-100 bg-brand-50 text-brand-800"
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className={`rounded-xl border p-4 ${card.className}`}>
          <p className="text-sm font-medium">{card.label}</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(card.value)}</p>
        </article>
      ))}
    </div>
  );
};
