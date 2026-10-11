"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useBudget } from "@/features/budget/context/BudgetProvider";
import { CategoryBadge } from "@/features/budget/components/CategoryBadge";
import { format } from "date-fns";

export function TransactionsList() {
  const { formatMoney } = useCurrency();
  const { state, removeTransaction } = useBudget();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Historique des transactions
      </h2>

      <div className="space-y-4">
        {state.transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div
                  className={`text-lg font-medium ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatMoney(transaction.amount)}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CategoryBadge category={transaction.category} />
              <button
                onClick={() => removeTransaction(transaction.id)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Supprimer"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
