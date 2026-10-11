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
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const compact = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const chartDate = (value: string, detailed = false) =>
    new Intl.DateTimeFormat(
      locale,
      value.length === 7
        ? {
            month: "short",
            year: detailed ? "numeric" : undefined,
            timeZone: "UTC",
          }
        : {
            day: "numeric",
            month: "short",
            year: detailed ? "numeric" : undefined,
            timeZone: "UTC",
          },
    ).format(
      new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`),
    );
  if (
    !data.length ||
    data.every((point) => point.revenue === 0 && point.expenses === 0)
  )
    return (
      <div className="flex min-h-80 items-center justify-center">
        <EmptyState
          title={t("Aucune activité sur cette période")}
          description={t(
            "Ajoutez une transaction pour visualiser les tendances de votre activité.",
          )}
        />
      </div>
    );
  return (
    <div className="h-80 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => chartDate(value)}
            tick={{ fontSize: 11 }}
            minTickGap={32}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => compact.format(value)}
            width={60}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => formatMoney(value)}
            labelFormatter={(label) => chartDate(String(label), true)}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            name={t("Chiffre d'affaires")}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#fb7185"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            name={t("Dépenses")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
