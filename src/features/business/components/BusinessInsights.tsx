"use client";
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
  return (
    <section className="ui-card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {t("Votre activité en détail")}
        </h2>
        <span className="ui-muted text-sm">
          {analytics.transactionCount} {t("opérations sur la période")}
        </span>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="ui-muted text-sm">{t("Marge nette")}</p>
          <p
            className={`mt-1 text-3xl font-bold ${analytics.totals.profit < 0 ? "text-rose-600 dark:text-rose-300" : "text-teal-700 dark:text-teal-300"}`}
          >
            {analytics.margin == null
              ? "—"
              : `${analytics.margin.toLocaleString(locale)} %`}
          </p>
          <p className="ui-muted mt-2 text-sm">
            {t(
              "Bénéfice divisé par le chiffre d’affaires. Sans revenu, la marge ne peut pas être calculée.",
            )}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">{t("Principales dépenses")}</h3>
          {(analytics.expenseCategories ?? []).length === 0 && (
            <p className="ui-muted mt-2 text-sm">
              {t("Aucune dépense pour cette période.")}
            </p>
          )}
          <ul className="mt-2 space-y-3">
            {(analytics.expenseCategories ?? []).slice(0, 5).map((category) => (
              <li key={category.category}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 break-words">
                    {t(category.category)}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatMoney(category.amount)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{ width: `${category.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
