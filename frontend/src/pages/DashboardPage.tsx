import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { CategoryBreakdownChart } from "../components/dashboard/CategoryBreakdownChart";
import { MonthlyTrendChart } from "../components/dashboard/MonthlyTrendChart";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { useAuth } from "../hooks/useAuth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);

export const DashboardPage = () => {
  const { user } = useAuth();
  const showOwner = user?.role === "ADMIN";

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.summary
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard", "monthly-trends"],
    queryFn: () => dashboardApi.monthlyTrends(6)
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: () => dashboardApi.recentTransactions(5)
  });

  if (summaryQuery.isLoading || trendsQuery.isLoading || recentQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (summaryQuery.isError || trendsQuery.isError || recentQuery.isError) {
    return <ErrorState message="Unable to load dashboard data." />;
  }

  if (!summaryQuery.data || !trendsQuery.data || !recentQuery.data) {
    return <ErrorState message="Dashboard data is unavailable." />;
  }

  return (
    <div className="space-y-6">
      <SummaryCards summary={summaryQuery.data} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyTrendChart data={trendsQuery.data} />
        <CategoryBreakdownChart summary={summaryQuery.data} />
      </div>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                {showOwner ? <th className="px-3 py-2">User</th> : null}
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentQuery.data.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-3 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                  {showOwner ? (
                    <td className="px-3 py-2">
                      <div className="min-w-[170px]">
                        <p className="font-medium text-slate-700">{transaction.owner?.name || "Unknown User"}</p>
                        <p className="text-xs text-slate-500">{transaction.owner?.email || transaction.userId}</p>
                      </div>
                    </td>
                  ) : null}
                  <td className="px-3 py-2">{transaction.category}</td>
                  <td className="px-3 py-2">{transaction.type}</td>
                  <td className="px-3 py-2 font-semibold">{formatCurrency(transaction.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
