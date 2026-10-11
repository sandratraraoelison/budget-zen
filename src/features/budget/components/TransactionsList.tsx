"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, Trash2 } from "lucide-react";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { useBudget } from "../context/BudgetProvider";
import { CategoryBadge } from "./CategoryBadge";
import EmptyState from "@/components/ui/EmptyState";
import { format } from "date-fns";

export function TransactionsList() {
  const { formatMoney } = useCurrency();
  const { state, removeTransaction } = useBudget();
  const [search, setSearch] = useState("");
  const transactions = state.transactions
    .filter((t) =>
      `${t.description} ${t.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .slice()
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return (
    <section className="ui-card" aria-labelledby="history-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-heading" className="ui-title">
          Historique des transactions{" "}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
            {state.transactions.length}
          </span>
        </h2>
        <div className="relative w-full sm:w-56">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            aria-hidden="true"
          />
          <input
            aria-label="Rechercher une transaction"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher..."
            className="w-full border py-2.5 pl-9 pr-3"
          />
        </div>
      </div>
      {transactions.length === 0 ? (
        <EmptyState
          title={search ? "Aucun résultat" : "Votre historique commence ici"}
          description={
            search
              ? "Essayez une autre description ou catégorie."
              : "Ajoutez votre première transaction pour suivre vos finances."
          }
          action={
            search ? (
              <button
                onClick={() => setSearch("")}
                className="text-sm font-semibold text-teal-800"
              >
                Effacer la recherche
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const income = transaction.type === "income";
            const Icon = income ? ArrowDownLeft : ArrowUpRight;
            return (
              <li
                key={transaction.id}
                className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span
                  className={`mt-1 rounded-xl p-2 ${income ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="break-words text-sm font-medium text-slate-800">
                      {transaction.description}
                    </p>
                    <p
                      className={`break-words text-sm font-semibold tabular-nums ${income ? "text-emerald-700" : "text-slate-900"}`}
                    >
                      {income ? "+" : "−"}
                      {formatMoney(transaction.amount)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {format(transaction.date, "dd/MM/yyyy")}
                    </span>
                    <CategoryBadge category={transaction.category} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Supprimer cette transaction ?"))
                      removeTransaction(transaction.id);
                  }}
                  className="ui-icon-button hover:text-red-600"
                  aria-label={`Supprimer ${transaction.description}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
