"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useBudget } from "@/features/budget/context/BudgetProvider";

export default function BalanceCard() {
  const { formatMoney } = useCurrency();
  const { totalIncome, totalExpenses, balance } = useBudget();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Solde</h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Total Revenus :</span>
          <span className="text-green-600">+{formatMoney(totalIncome)}</span>
        </div>

        <div className="flex justify-between">
          <span>Total Dépenses :</span>
          <span className="text-red-600">-{formatMoney(totalExpenses)}</span>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between font-semibold">
            <span>Solde restant :</span>
            <span className={balance >= 0 ? "text-blue-600" : "text-red-600"}>
              {formatMoney(balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
