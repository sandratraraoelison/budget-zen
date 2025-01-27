"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Fév", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 9800, expenses: 4000 },
  { month: "Avr", revenue: 6780, expenses: 2500 },
];

export default function BusinessChart({ timeRange }: { timeRange: string }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Chiffre d'affaires"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            name="Dépenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
