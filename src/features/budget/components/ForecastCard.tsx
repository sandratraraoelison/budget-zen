"use client";

import { useBudget } from "@/features/budget/context/BudgetProvider";
import { useMemo } from "react";
import { spendingForecast } from "../domain/forecast";
import { useCurrency } from "@/features/settings/CurrencyProvider";
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
  const { formatMoney, currency } = useCurrency();
  const forecastData = useMemo(
    () => spendingForecast(state.transactions),
    [state.transactions],
  );

  return (
    <div className="ui-card">
      <h2 className="text-xl font-semibold mb-4">Prévisions de dépenses</h2>
      <p className="mb-4 text-sm text-gray-500">
        Estimation basée sur la moyenne des mois terminés, sans hypothèse de
        croissance.
      </p>
      {forecastData.length === 0 && (
        <p className="text-gray-500">
          Enregistrez des dépenses sur un mois terminé pour obtenir une
          estimation.
        </p>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <XAxis dataKey="month" />
            <YAxis
              label={{ value: currency, angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(value: number) => formatMoney(value)} />
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
