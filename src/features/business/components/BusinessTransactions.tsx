"use client";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import type { BusinessTransaction as Transaction } from "../types";

export default function BusinessTransactions({
  transactions,
  onDelete,
  pending,
  onEdit,
}: {
  transactions: Transaction[];
  onDelete(id: string): Promise<void>;
  pending: boolean;
  onEdit(transaction: Transaction): void;
}) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [count, setCount] = useState(10);
  const [error, setError] = useState("");
  const filtered = transactions
    .filter(
      (item) =>
        (type === "all" || item.type === type) &&
        `${item.category} ${item.description}`
          .toLocaleLowerCase(locale)
          .includes(search.toLocaleLowerCase(locale)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="ui-card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="ui-title">{t("Transactions récentes")}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {filtered.length}
          </span>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[minmax(200px,1fr)_160px]">
          <div className="relative">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />
            <input
              className="h-11 w-full border py-2 pl-10 pr-3"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCount(10);
              }}
              placeholder={t("Rechercher une opération…")}
              aria-label={t("Rechercher une opération…")}
            />
          </div>
          <select
            className="h-11 w-full border px-3 py-2"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setCount(10);
            }}
            aria-label={t("Type de transaction")}
          >
            <option value="all">{t("Tous les types")}</option>
            <option value="income">{t("Revenus")}</option>
            <option value="expense">{t("Dépenses")}</option>
          </select>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-3 text-sm text-rose-600 dark:text-rose-300"
        >
          {error}
        </p>
      )}
      {!filtered.length && (
        <p className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          {t(
            search || type !== "all"
              ? "Aucun résultat pour ces filtres."
              : "Aucune transaction pour cette période.",
          )}
        </p>
      )}
      {!!filtered.length && (
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(0,1fr)_130px_180px_88px] gap-4 border-b border-slate-200 pb-3 text-xs font-medium text-slate-400 md:grid dark:border-slate-700"
        >
          <span>{t("Opération")}</span>
          <span>{t("Date")}</span>
          <span className="text-right">{t("Montant")}</span>
          <span className="text-right">{t("Actions")}</span>
        </div>
      )}
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.slice(0, count).map((transaction) => {
          const income = transaction.type === "income";
          const Icon = income ? ArrowDownLeft : ArrowUpRight;
          return (
            <li
              key={transaction.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-4 md:grid-cols-[minmax(0,1fr)_130px_180px_88px]"
            >
              <div className="order-1 flex min-w-0 items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${income ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {transaction.category}
                  </p>
                  <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                    {transaction.description}
                  </p>
                </div>
              </div>
              <time
                className="order-3 pl-[52px] text-xs text-slate-500 md:order-2 md:pl-0 dark:text-slate-400"
                dateTime={transaction.date}
              >
                {new Date(
                  `${transaction.date.slice(0, 10)}T12:00:00`,
                ).toLocaleDateString(locale)}
              </time>
              <p
                className={`order-2 text-right text-sm font-semibold tabular-nums md:order-3 ${income ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}
              >
                <span className="sr-only">
                  {t(income ? "Revenu" : "Dépense")}{" "}
                </span>
                {income ? "+" : "−"}
                {formatMoney(transaction.amount)}
              </p>
              <div className="order-4 flex justify-end gap-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onEdit(transaction)}
                  className="ui-icon-button"
                  aria-label={t("Modifier")}
                  title={t("Modifier")}
                >
                  <Pencil size={17} />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/60"
                  aria-label={t("Supprimer")}
                  title={t("Supprimer")}
                  onClick={async () => {
                    if (!window.confirm(t("Supprimer cette opération ?")))
                      return;
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
            </li>
          );
        })}
      </ul>
      {filtered.length > count && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-teal-700 hover:bg-teal-50 dark:border-slate-700 dark:text-teal-300 dark:hover:bg-slate-800"
            onClick={() => setCount(count + 10)}
          >
            {t("Afficher plus")}
          </button>
        </div>
      )}
    </section>
  );
}
