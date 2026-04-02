import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardSummary } from "../../types";

type CategoryBreakdownChartProps = {
  summary: DashboardSummary;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);

const tooltipFormatter = (value: number) => formatCurrency(value);

export const CategoryBreakdownChart = ({ summary }: CategoryBreakdownChartProps) => {
  const chartData = [
    { name: "Income", value: summary.totalIncome, color: "#16a34a" },
    { name: "Expense", value: summary.totalExpense, color: "#dc2626" }
  ];

  const hasData = summary.totalIncome + summary.totalExpense > 0;

  return (
    <div className="h-80 rounded-xl border border-slate-200 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Income vs Expense</h3>
      {!hasData ? (
        <div className="flex h-[90%] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
          No financial data available.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="82%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <p className="mt-1 text-center text-xs font-medium text-slate-600">
            Net Balance:{" "}
            <span className={summary.netBalance >= 0 ? "text-green-700" : "text-red-700"}>
              {formatCurrency(summary.netBalance)}
            </span>
          </p>
        </>
      )}
    </div>
  );
};
