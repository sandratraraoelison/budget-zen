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
import { useBudget } from "@/context/BudgetProvider";

export default function SpendingChart() {
  const { state, getCategorySpending } = useBudget();
  const categories = Array.from(new Set(state.budgets.map((b) => b.category)));

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
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
