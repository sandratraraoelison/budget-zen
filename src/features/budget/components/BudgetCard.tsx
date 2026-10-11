"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { getCategoryLabel } from "../domain/categorization";
import { cn } from "@/lib/utils";
import BudgetEditForm from "@/features/budget/components/BudgetEditForm";
import EmptyState from "@/components/ui/EmptyState";
import { Pencil, Trash2 } from "lucide-react";

export default function BudgetCard() {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const { state, removeBudget } = useBudget();
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  if (state.budgets.length === 0) {
    return (
      <div>
        <h2 className="ui-title mb-4">{t("Vos budgets")}</h2>
        <EmptyState
          title={t("Donnez un cap à vos dépenses")}
          description={t("Définissez une limite par catégorie avec le formulaire ci-dessous.")}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="ui-title mb-4">{t("Vos budgets")}</h2>

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
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : isWarning
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                    : "border-green-500 bg-green-50 dark:bg-green-950",
              )}
            >
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-sm font-medium capitalize">
                  {t(getCategoryLabel(budget.category))}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums break-words",
                      isOverLimit || isAtLimit
                        ? "text-red-600 dark:text-red-300"
                        : isWarning
                          ? "text-orange-600 dark:text-orange-300"
                          : "text-green-600 dark:text-green-300",
                    )}
                  >
                    {formatMoney(budget.current)} / {formatMoney(budget.limit)}
                  </span>
                  <button
                    onClick={() => setEditingBudgetId(budget.id)}
                    className="ui-icon-button"
                    aria-label={t("Modifier le budget")}
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => removeBudget(budget.id)}
                    className="ui-icon-button hover:text-red-600 dark:hover:text-red-300"
                    aria-label={t("Supprimer le budget")}
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

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-slate-800">
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
                <p className="text-red-600 text-sm mt-2 dark:text-red-300">
                  {isAtLimit
                    ? t("Budget atteint à 100%")
                    : t("Budget dépassé de {amount}", { amount: formatMoney(budget.current - budget.limit) })}
                </p>
              )}

              {isWarning && (
                <p className="text-orange-600 text-sm mt-2">
                  {percentage.toFixed(0)}{t("% du budget utilisé")}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
