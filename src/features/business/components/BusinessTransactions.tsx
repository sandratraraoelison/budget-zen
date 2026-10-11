"use client";

import { useState } from "react";
import { useCurrency } from "@/features/settings/CurrencyProvider";

import type { BusinessTransaction as Transaction } from "@/features/business/types";

export default function BusinessTransactions({
  transactions,
  onDelete,
  pending,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  pending: boolean;
}) {
  const { formatMoney } = useCurrency();
  const [error, setError] = useState("");
  return (
    <div className="ui-card">
      <h2 className="text-xl font-semibold mb-4">Transactions récentes</h2>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {transactions.length === 0 && (
        <p className="text-gray-500">Aucune transaction pour cette période.</p>
      )}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{transaction.category}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString("fr-FR")}
                {transaction.description && ` • ${transaction.description}`}
              </p>
            </div>
            <div
              className={`text-lg ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatMoney(transaction.amount)}
              <button
                disabled={pending}
                className="ml-3 text-sm text-red-600 disabled:opacity-50"
                onClick={async () => {
                  try {
                    await onDelete(transaction.id);
                    setError("");
                  } catch (error) {
                    setError((error as Error).message);
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
