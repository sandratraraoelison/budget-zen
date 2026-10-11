"use client";
import { PieChart } from "lucide-react";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { BusinessAnalytics } from "../types";

export default function BusinessInsights({
  analytics,
}: {
  analytics: BusinessAnalytics;
}) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const categories = analytics.expenseCategories ?? [];
  return (
    <section className="ui-card h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="ui-title">{t("Principales dépenses")}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("Répartition sur la période")}
          </p>
        </div>
        <PieChart
          size={20}
          className="shrink-0 text-rose-400"
          aria-hidden="true"
        />
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight">
        {formatMoney(analytics.totals.expenses)}
      </p>
      {!categories.length && (
        <div className="flex min-h-48 items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
          {t("Aucune dépense pour cette période.")}
        </div>
      )}
      <ul className="mt-5 space-y-5">
        {categories.slice(0, 5).map((category, index) => (
          <li key={category.category}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 break-words font-medium">
                {category.category}
              </span>
              <span className="shrink-0 font-semibold">
                {formatMoney(category.amount)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${index % 2 === 0 ? "bg-rose-400" : "bg-orange-300"}`}
                  style={{ width: `${category.share}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-slate-500 dark:text-slate-400">
                {category.share.toLocaleString(locale)} %
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
