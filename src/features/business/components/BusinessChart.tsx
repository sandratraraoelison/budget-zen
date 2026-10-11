"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { BusinessAnalytics } from "../types";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BusinessChart({
  data,
}: {
  data: BusinessAnalytics["chart"];
}) {
  const { formatMoney, currency } = useCurrency();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{ value: currency, angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value: number) => formatMoney(value)} />
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
