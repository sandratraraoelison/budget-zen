"use client";

import { useBudget } from "../context/BudgetProvider";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { FundingEntry } from "../types";

const labels = {
  deposit: "Mise de côté",
  withdrawal: "Retrait",
  adjustment: "Correction du montant",
  release: "Restitution après suppression",
  opening: "Montant déjà mis de côté",
};

export default function FundingHistory({ entries }: { entries?: FundingEntry[] }) {
  const { state } = useBudget();
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const history = [...(entries ?? state.fundingHistory ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <details className="ui-card mt-4">
      <summary className="cursor-pointer font-semibold">
        {t("Historique des mises de côté")} ({history.length})
      </summary>
      <p className="ui-muted mt-3 text-sm">{t("Un versement réduit le solde disponible. Un retrait le réaugmente.")}</p>
      {!history.length && <p className="ui-muted mt-3 text-sm">{t("Aucun mouvement pour le moment.")}</p>}
      <ul className="mt-3 max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
        {history.map((entry) => (
          <li key={`${entry.source}:${entry.id}`} className="flex items-start justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="break-words font-semibold">{entry.goalName}</p>
              <p className="ui-muted">{t(labels[entry.reason])} · {t(entry.source === "project" ? "Projet" : "Épargne")}</p>
              <time className="ui-muted text-xs" dateTime={entry.date}>{new Date(entry.date).toLocaleString(locale)}</time>
            </div>
            <span className={`shrink-0 font-semibold ${entry.amount > 0 ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"}`}>
              {entry.amount > 0 ? "−" : "+"}{formatMoney(Math.abs(entry.amount))}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
