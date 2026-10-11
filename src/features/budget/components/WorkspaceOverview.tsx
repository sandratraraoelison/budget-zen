"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import Link from "next/link";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  FolderOpen,
  HandCoins,
  Wallet,
} from "lucide-react";
import { useBudget } from "../context/BudgetProvider";
import { useCredits } from "@/features/credits/context/CreditsProvider";
import { getCreditStatus } from "@/features/credits/domain/credit";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { sumAmounts } from "@/shared/domain/money";

export default function WorkspaceOverview() {
  const { t } = useLocale();
  const { state } = useBudget();
  const { credits } = useCredits();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects({ readOnly: true });
  const {
    analytics,
    loading: businessLoading,
    error: businessError,
    reload,
  } = useBusiness("month");
  const { formatMoney } = useCurrency();
  const budgetLimit = sumAmounts(state.budgets.map((b) => b.limit));
  const budgetSpent = sumAmounts(state.budgets.map((b) => b.current));
  const overBudget = state.budgets.filter((b) => b.current > b.limit).length;
  const outstanding = credits.filter((c) => c.remainingAmount > 0);
  const overdue = outstanding.filter(
    (c) => getCreditStatus(c) === "expired",
  ).length;
  const activeProjects = projects.filter((p) => p.status === "en-cours").length;
  const cards = [
    {
      title: t("Budgets"),
      href: "#budget-summary",
      icon: Wallet,
      metric: `${state.budgets.length} budget${state.budgets.length > 1 ? "s" : ""}`,
      detail: budgetLimit
        ? t("{count} % de vos limites utilisés", { count: Math.round((budgetSpent / budgetLimit) * 100) })
        : t("Définissez vos premières limites de dépenses"),
      status: overBudget
        ? t("{count} en dépassement", { count: overBudget })
        : state.budgets.length
          ? t("Dans les limites")
          : t("À configurer"),
      warning: overBudget > 0,
      loading: false,
      error: "",
    },
    {
      title: t("Projets"),
      href: "/projets",
      icon: FolderOpen,
      metric: t("{count} en cours", { count: activeProjects }),
      detail: projects.length
        ? t("{count} achevé(s) · {total} au total", { count: projects.length - activeProjects, total: projects.length })
        : t("Organisez vos prochains projets"),
      status: t("Voir les projets"),
      warning: false,
      loading: projectsLoading,
      error: projectsError,
    },
    {
      title: t("Crédits"),
      href: "/credit",
      icon: HandCoins,
      metric: t("{count} non soldé(s)", { count: outstanding.length }),
      detail: credits.length
        ? t("{count} soldé(s) · {total} au total", { count: credits.length - outstanding.length, total: credits.length })
        : t("Suivez vos prêts et vos emprunts"),
      status: overdue
        ? t("{count} échéance(s) dépassée(s)", { count: overdue })
        : t("Voir les crédits"),
      warning: overdue > 0,
      loading: false,
      error: "",
    },
    {
      title: "Business",
      href: "/business",
      icon: ChartNoAxesCombined,
      metric: analytics ? formatMoney(analytics.totals.profit) : "—",
      detail: t("Résultat net du mois en cours"),
      status:
        analytics && analytics.totals.profit < 0
          ? t("Résultat négatif")
          : t("Voir l’activité"),
      warning: !!analytics && analytics.totals.profit < 0,
      loading: businessLoading,
      error: businessError,
    },
  ];
  return (
    <section className="mt-7" aria-labelledby="overview-heading">
      <div className="mb-4">
        <h2 id="overview-heading" className="ui-title">{t("Vos rubriques en un coup d’œil")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t("Les informations essentielles, avec un accès direct à chaque espace.")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ({
            title,
            href,
            icon: Icon,
            metric,
            detail,
            status,
            warning,
            loading,
            error,
          }) => (
            <article key={title} className="ui-card flex flex-col !p-5">
              <Link
                href={href}
                className="group flex items-center justify-between gap-3 rounded-lg"
                aria-label={t("Ouvrir la rubrique {title}", { title })}
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-xl bg-teal-50 p-2.5 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t(title)}
                  </h3>
                </span>
                <ArrowUpRight
                  size={17}
                  className="text-slate-400 transition group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:text-teal-300"
                  aria-hidden="true"
                />
              </Link>
              <div className="my-4 min-h-16" aria-busy={loading}>
                <p className="break-words text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                  {loading ? t("Chargement…") : error ? t("Indisponible") : metric}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
                  {error ? t("Impossible de charger ce résumé.") : detail}
                </p>
              </div>
              <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-700">
                {error && title === "Business" ? (
                  <button
                    onClick={reload}
                    className="text-xs font-semibold text-teal-800 dark:text-teal-300"
                  >{t("Réessayer")}</button>
                ) : (
                  <Link
                    href={href}
                    className={`text-xs font-medium ${warning && !error && !loading ? "text-amber-700 dark:text-amber-300" : "text-teal-800 dark:text-teal-300"}`}
                  >
                    {error
                      ? t("Ouvrir la rubrique")
                      : loading
                        ? t("Voir la rubrique")
                        : status}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
