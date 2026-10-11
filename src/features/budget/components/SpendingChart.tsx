"use client";
import { sumAmounts } from "@/shared/domain/money";
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
  const { state } = useBudget();
  const { formatMoney, formatNumber, currency } = useCurrency();
  const groups = new Map<string, { category: string; amount: number }>();
  for (const transaction of state.transactions.filter(
    (t) => t.type === "expense",
  )) {
    const key = JSON.stringify([
      transaction.category,
      transaction.customCategoryName?.toLowerCase() ?? "",
    ]);
    const group = groups.get(key);
    groups.set(key, {
      category:
        transaction.customCategoryName ??
        t(getCategoryLabel(transaction.category)),
      amount: sumAmounts([group?.amount ?? 0, transaction.amount]),
    });
  }
  const data = Array.from(groups.values());

  return (
    <section className="ui-card">
      <h2 className="ui-title mb-1">{t("Dépenses par catégorie")}</h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-300">
        {t("Comprenez les principaux postes de votre budget.")}
      </p>
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
                tickFormatter={formatNumber}
                width={100}
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
