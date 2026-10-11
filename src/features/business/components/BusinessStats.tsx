"use client";

import type { BusinessAnalytics } from "../types";
import { useCurrency } from "@/features/settings/CurrencyProvider";

export default function BusinessStats({
  analytics,
}: {
  analytics: BusinessAnalytics | null;
}) {
  const { formatMoney } = useCurrency();
  const stats = [
    { key: "revenue", title: "Chiffre d'affaires" },
    { key: "expenses", title: "Dépenses" },
    { key: "profit", title: "Bénéfice net" },
  ] as const;
  return (
    <div className="space-y-4">
      {stats.map(({ key, title }) => {
        const change = analytics?.change[key];
        const favorable =
          change == null || (key === "expenses" ? change <= 0 : change >= 0);
        return (
          <div key={key} className="ui-card">
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-2">
              {analytics ? formatMoney(analytics.totals[key]) : "—"}
            </p>
            {analytics && (
              <p
                className={`mt-4 text-sm ${favorable ? "text-green-600" : "text-red-600"}`}
              >
                {change == null
                  ? "Pas de base de comparaison"
                  : `${change > 0 ? "+" : ""}${change}% vs période précédente`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
