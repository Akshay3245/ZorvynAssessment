import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MonthlyTrend } from "../../types";

type MonthlyTrendChartProps = {
  data: MonthlyTrend[];
};

export const MonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => (
  <div className="h-80 rounded-xl border border-slate-200 p-4">
    <h3 className="mb-4 text-sm font-semibold text-slate-700">Monthly Trends</h3>
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
        <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
