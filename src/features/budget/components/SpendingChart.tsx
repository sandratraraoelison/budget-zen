"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

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
import { getCategoryLabel } from "../domain/categorization";
import EmptyState from "@/components/ui/EmptyState";

export default function SpendingChart() {
  const { t } = useLocale();
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
    category: t(getCategoryLabel(category)),
    amount: getCategorySpending(category),
  }));

  return (
    <section className="ui-card">
      <h2 className="ui-title mb-1">{t("Dépenses par catégorie")}</h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-300">{t("Comprenez les principaux postes de votre budget.")}</p>
      {data.length === 0 ? (
        <EmptyState
          title={t("Aucune dépense pour le moment")}
          description={t("Le graphique apparaîtra dès votre première dépense.")}
        />
      ) : (
        <div className="h-64 min-w-0 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                label={{ value: currency, angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Bar
                dataKey="amount"
                name={t("Dépenses")}
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
