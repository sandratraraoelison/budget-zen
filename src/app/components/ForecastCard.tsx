"use client";

import { useBudget } from "@/context/BudgetProvider";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ForecastCard() {
  const { state } = useBudget();
  const [forecastData, setForecastData] = useState<
    Array<{ month: string; amount: number }>
  >([]);

  useEffect(() => {
    //Calculation of average monthly expenses
    const monthlySpending = state.transactions.reduce((acc, transaction) => {
      if (transaction.type === "expense") {
        const month = new Date(transaction.date).toLocaleString("fr-FR", {
          month: "short",
        });
        acc[month] = (acc[month] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const average =
      Object.values(monthlySpending).reduce((sum, val) => sum + val, 0) /
        Object.keys(monthlySpending).length || 0;

    // Forecast generation
    const forecast = Array.from({ length: 6 }).map((_, i) => ({
      month: new Date(Date.now() + i * 2629800000).toLocaleString("fr-FR", {
        month: "short",
      }),
      amount: average * (1 + i * 0.1), // Increase of 10% per month
    }));

    setForecastData(forecast);
  }, [state.transactions]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Prévisions de dépenses</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
