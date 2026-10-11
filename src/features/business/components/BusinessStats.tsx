"use client";
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, Percent } from "lucide-react";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { BusinessAnalytics } from "../types";

export default function BusinessStats({ analytics, loading = false }: { analytics: BusinessAnalytics | null; loading?: boolean }) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const stats = [
    { key: "revenue", title: "Chiffre d'affaires", icon: ArrowDownLeft, accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    { key: "expenses", title: "Dépenses", icon: ArrowUpRight, accent: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
    { key: "profit", title: "Bénéfice net", icon: ChartNoAxesCombined, accent: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" },
  ] as const;
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("Synthèse des finances")} aria-busy={loading}>
      {stats.map(({ key, title, icon: Icon, accent }) => {
        const change = analytics?.change[key];
        const favorable = change == null || (key === "expenses" ? change <= 0 : change >= 0);
        return <div key={key} className="ui-card flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500 dark:text-slate-300">{t(title)}</p><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}><Icon size={18} aria-hidden="true" /></span></div>
          {loading ? <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" /> : <p className={`break-words text-2xl font-bold tracking-tight ${key === "profit" && analytics && analytics.totals.profit < 0 ? "text-rose-600 dark:text-rose-300" : ""}`}>{analytics ? formatMoney(analytics.totals[key]) : "—"}</p>}
          <p className={`mt-auto text-xs leading-relaxed ${favorable ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
            {!analytics ? "—" : change == null ? t("Pas de base de comparaison") : t("{change}% vs période précédente", { change: `${change > 0 ? "+" : ""}${change.toLocaleString(locale)}` })}
          </p>
        </div>;
      })}
      <div className="ui-card flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500 dark:text-slate-300">{t("Marge nette")}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"><Percent size={18} aria-hidden="true" /></span></div>
        {loading ? <div className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" /> : <p className={`text-2xl font-bold tracking-tight ${analytics && analytics.totals.profit < 0 ? "text-rose-600 dark:text-rose-300" : ""}`}>{analytics?.margin == null ? "—" : `${analytics.margin.toLocaleString(locale)} %`}</p>}
        <p className="mt-auto text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t("Bénéfice / chiffre d’affaires")}</p>
      </div>
    </section>
  );
}
