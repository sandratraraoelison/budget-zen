"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";

export default function SpendingChart() {
  const { state, getCategorySpending } = useBudget();
  const { formatMoney, currency } = useCurrency();
  const categories = Array.from(
    new Set(
      state.transactions
        .filter((t) => t.type === "expense")
        .map((t) => t.category),
    ),
  );

  const data = categories.map((category) => ({
    category,
    amount: getCategorySpending(category),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h2 className="text-xl font-semibold mb-4">Dépenses par catégorie</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis
            label={{ value: currency, angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value: number) => formatMoney(value)} />
          <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
