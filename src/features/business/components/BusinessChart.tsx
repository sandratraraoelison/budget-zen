"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { BusinessAnalytics } from "../types";
import EmptyState from "@/components/ui/EmptyState";

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
  const { t } = useLocale();
  const { formatMoney, formatNumber, currency } = useCurrency();
  if (
    !data.length ||
    data.every((point) => point.revenue === 0 && point.expenses === 0)
  )
    return (
      <EmptyState
        title={t("Aucune activité sur cette période")}
        description={t("Ajoutez une transaction pour visualiser les tendances de votre activité.")}
      />
    );
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            minTickGap={32}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
                tickFormatter={formatNumber}
                width={100}
            label={{ value: currency, angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value: number) => formatMoney(value)} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0f766e"
            strokeWidth={2}
            name={t("Chiffre d'affaires")}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            name={t("Dépenses")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
