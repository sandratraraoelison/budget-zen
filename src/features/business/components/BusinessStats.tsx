"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import type { BusinessAnalytics } from "../types";
import { useCurrency } from "@/features/settings/CurrencyProvider";

export default function BusinessStats({
  analytics,
}: {
  analytics: BusinessAnalytics | null;
}) {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const stats = [
    { key: "revenue", title: t("Chiffre d'affaires") },
    { key: "expenses", title: t("Dépenses") },
    { key: "profit", title: t("Bénéfice net") },
  ] as const;
  return (
    <div className="space-y-4">
      {stats.map(({ key, title }) => {
        const change = analytics?.change[key];
        const favorable =
          change == null || (key === "expenses" ? change <= 0 : change >= 0);
        return (
          <div key={key} className="ui-card">
            <p className="text-gray-500 text-sm dark:text-slate-300">{t(title)}</p>
            <p className="text-2xl font-bold mt-2">
              {analytics ? formatMoney(analytics.totals[key]) : "—"}
            </p>
            {analytics && (
              <p
                className={`mt-4 text-sm ${favorable ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}
              >
                {change == null
                  ? t("Pas de base de comparaison")
                  : t("{change}% vs période précédente", { change: `${change > 0 ? "+" : ""}${change}` })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
