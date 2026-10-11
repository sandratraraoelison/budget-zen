"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import { useCurrency } from "@/features/settings/CurrencyProvider";

import type { BusinessTransaction as Transaction } from "@/features/business/types";

export default function BusinessTransactions({
  transactions,
  onDelete,
  pending,
  onEdit,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  pending: boolean;
  onEdit(transaction: Transaction): void;
}) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const filtered = transactions
    .filter(
      (item) =>
        (type === "all" || item.type === type) &&
        `${item.category} ${item.description}`
          .toLocaleLowerCase(locale)
          .includes(search.toLocaleLowerCase(locale)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const [error, setError] = useState("");
  return (
    <div className="ui-card">
      <h2 className="text-xl font-semibold mb-4">
        {t("Transactions récentes")}
      </h2>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="ui-input min-w-0 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Rechercher une opération…")}
          aria-label={t("Rechercher une opération…")}
        />
        <select
          className="ui-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label={t("Type de transaction")}
        >
          <option value="all">{t("Tous les types")}</option>
          <option value="income">{t("Revenus")}</option>
          <option value="expense">{t("Dépenses")}</option>
        </select>
      </div>
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-300">
          {t(error)}
        </p>
      )}
      {filtered.length === 0 && (
        <p className="text-gray-500 dark:text-slate-300">
          {t("Aucune transaction pour cette période.")}
        </p>
      )}
      <div className="space-y-3">
        {filtered.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg dark:bg-slate-950"
          >
            <div className="min-w-0 flex-1 break-words">
              <p className="font-medium">{t(transaction.category)}</p>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                {new Date(
                  `${transaction.date.slice(0, 10)}T12:00:00`,
                ).toLocaleDateString(locale)}
                {transaction.description && ` • ${transaction.description}`}
              </p>
            </div>
            <div
              className={`text-lg ${
                transaction.type === "income"
                  ? "text-green-600 dark:text-green-300"
                  : "text-red-600 dark:text-red-300"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatMoney(transaction.amount)}
              <button
                type="button"
                disabled={pending}
                onClick={() => onEdit(transaction)}
                className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border"
                aria-label={t("Modifier")}
                title={t("Modifier")}
              >
                <Pencil size={17} />
              </button>
              <button
                aria-label={t("Supprimer")}
                title={t("Supprimer")}
                disabled={pending}
                type="button"
                className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border text-red-600 disabled:opacity-50 dark:text-red-300"
                onClick={async () => {
                  if (!window.confirm(t("Supprimer cette opération ?"))) return;
                  try {
                    await onDelete(transaction.id);
                    setError("");
                  } catch (error) {
                    setError((error as Error).message);
                  }
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
