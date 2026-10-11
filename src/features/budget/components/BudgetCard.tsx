"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { cn } from "@/lib/utils";
import BudgetEditForm from "@/features/budget/components/BudgetEditForm";
import EmptyState from "@/components/ui/EmptyState";
import { Pencil, Trash2 } from "lucide-react";

export default function BudgetCard() {
  const { formatMoney } = useCurrency();
  const { state, removeBudget } = useBudget();
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  if (state.budgets.length === 0) {
    return (
      <div>
        <h2 className="ui-title mb-4">Vos budgets</h2>
        <EmptyState
          title="Donnez un cap à vos dépenses"
          description="Définissez une limite par catégorie avec le formulaire ci-dessous."
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="ui-title mb-4">Vos budgets</h2>

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
                    : "border-green-500 bg-green-50",
              )}
            >
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-sm font-medium capitalize">
                  {budget.category}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums break-words",
                      isOverLimit || isAtLimit
                        ? "text-red-600"
                        : isWarning
                          ? "text-orange-600"
                          : "text-green-600",
                    )}
                  >
                    {formatMoney(budget.current)} / {formatMoney(budget.limit)}
                  </span>
                  <button
                    onClick={() => setEditingBudgetId(budget.id)}
                    className="ui-icon-button"
                    aria-label="Modifier le budget"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => removeBudget(budget.id)}
                    className="ui-icon-button hover:text-red-600"
                    aria-label="Supprimer le budget"
                  >
                    <Trash2 size={15} aria-hidden="true" />
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
                        : "bg-green-500",
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {(isOverLimit || isAtLimit) && (
                <p className="text-red-600 text-sm mt-2">
                  {isAtLimit
                    ? "Budget atteint à 100%"
                    : `Budget dépassé de ${formatMoney(budget.current - budget.limit)}`}
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
