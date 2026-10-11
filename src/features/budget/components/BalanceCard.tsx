"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { useBudget } from "../context/BudgetProvider";

export default function BalanceCard() {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const { totalIncome, totalExpenses, balance } = useBudget();
  const [balanceHidden, setBalanceHidden] = useState(true);
  const [incomeHidden, setIncomeHidden] = useState(true);
  const [expensesHidden, setExpensesHidden] = useState(true);
  const cards = [
    {
      title: t("Solde disponible"),
      value: balance,
      description: t("Revenus moins dépenses"),
      featured: true,
      hidden: balanceHidden,
      toggle: () => setBalanceHidden((hidden) => !hidden),
      amountId: "available-balance",
      amountLabel: t("le solde disponible"),
      hiddenLabel: t("Solde masqué"),
    },
    {
      title: t("Total des revenus"),
      value: totalIncome,
      description: t("Toutes vos entrées d’argent"),
      featured: false,
      hidden: incomeHidden,
      toggle: () => setIncomeHidden((hidden) => !hidden),
      amountId: "total-income",
      amountLabel: t("les revenus"),
      hiddenLabel: t("Revenus masqués"),
    },
    {
      title: t("Total des dépenses"),
      value: totalExpenses,
      description: t("Toutes vos sorties d’argent"),
      featured: false,
      hidden: expensesHidden,
      toggle: () => setExpensesHidden((hidden) => !hidden),
      amountId: "total-expenses",
      amountLabel: t("les dépenses"),
      hiddenLabel: t("Dépenses masquées"),
    },
  ];
  return (
    <section
      className="grid gap-4 sm:grid-cols-3"
      aria-label={t("Synthèse des finances")}
    >
      {cards.map(
        ({
          title,
          value,
          description,
          featured,
          hidden,
          toggle,
          amountId,
          amountLabel,
          hiddenLabel,
        }) => (
          <div
            key={title}
            className={`min-w-0 rounded-2xl p-5 sm:p-6 ${featured ? "bg-teal-900 text-white shadow-sm" : "border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-900"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm font-medium ${featured ? "text-teal-100" : "text-slate-500 dark:text-slate-300"}`}
              >
                {t(title)}
              </p>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={`${hidden ? t("Afficher") : t("Masquer")} ${t(amountLabel!)}`}
                  aria-pressed={hidden}
                  aria-controls={amountId}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${featured ? "text-teal-100 hover:bg-white/10 dark:hover:bg-slate-900/10" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}`}
                >
                  {hidden ? (
                    <EyeOff size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>

            </div>
            <p
              id={amountId}
              aria-live="polite"
              className="mt-4 break-words text-xl font-bold tracking-tight tabular-nums sm:text-2xl"
            >
              {hidden ? (
                <>
                  <span aria-hidden="true">••••••</span>
                  <span className="sr-only">
                    {hiddenLabel}
                  </span>
                </>
              ) : (
                formatMoney(value)
              )}
            </p>
            <p
              className={`mt-2 text-xs ${featured ? "text-teal-100" : "text-slate-500 dark:text-slate-300"}`}
            >
              {t(description)}
            </p>
          </div>
        ),
      )}
    </section>
  );
}
