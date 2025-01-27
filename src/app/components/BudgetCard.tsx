"use client";

import { useState } from "react";
import { useBudget } from "@/context/BudgetProvider";
import { cn } from "@/lib/utils";
import BudgetEditForm from "@/components/BudgetEditForm";

export default function BudgetCard() {
  const { state, removeBudget } = useBudget();
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  if (state.budgets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Budgets</h2>
        <p className="text-gray-500">Aucun budget défini</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Budgets</h2>

      <div className="space-y-4">
        {state.budgets.map((budget) => {
          const percentage = (budget.current / budget.limit) * 100;
          const isAtLimit = budget.current === budget.limit;
          const isOverLimit = budget.current > budget.limit;
          const isWarning = percentage >= 75 && !isAtLimit && !isOverLimit;

          return (
            <div
              key={budget.id}
              className={cn(
                "border-l-4 p-4 rounded-lg transition-colors",
                isOverLimit || isAtLimit
                  ? "border-red-500 bg-red-50"
                  : isWarning
                  ? "border-orange-500 bg-orange-50"
                  : "border-green-500 bg-green-50"
              )}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{budget.category}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold",
                      isOverLimit || isAtLimit
                        ? "text-red-600"
                        : isWarning
                        ? "text-orange-600"
                        : "text-green-600"
                    )}
                  >
                    {budget.current.toFixed(2)}MGA / {budget.limit.toFixed(2)}
                    MGA
                  </span>
                  <button
                    onClick={() => setEditingBudgetId(budget.id)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                    aria-label="Modifier le budget"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => removeBudget(budget.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                    aria-label="Supprimer le budget"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {editingBudgetId === budget.id && (
                <BudgetEditForm
                  budget={budget}
                  onClose={() => setEditingBudgetId(null)}
                />
              )}

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={cn(
                    "rounded-full h-2 transition-all duration-300",
                    isOverLimit || isAtLimit
                      ? "bg-red-500"
                      : isWarning
                      ? "bg-orange-400"
                      : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {(isOverLimit || isAtLimit) && (
                <p className="text-red-600 text-sm mt-2">
                  {isAtLimit
                    ? "Budget atteint à 100%"
                    : `Budget dépassé de ${(
                        budget.current - budget.limit
                      ).toFixed(2)}MGA`}
                </p>
              )}

              {isWarning && (
                <p className="text-orange-600 text-sm mt-2">
                  {percentage.toFixed(0)}% du budget utilisé
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
