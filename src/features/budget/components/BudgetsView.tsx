"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useBudget } from "@/features/budget/context/BudgetProvider";
import BudgetCard from "@/features/budget/components/BudgetCard";
import BudgetForm from "@/features/budget/components/BudgetForm";

export default function BudgetsView() {
  const { t } = useLocale();
  const { state } = useBudget();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">{t("Nouveau Budget")}</h2>
        <BudgetForm />
      </div>

      <div className="bg-white rounded-lg shadow p-6 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">{t("Budgets Existants")}</h2>
        <div className="space-y-4">
          {state.budgets.length === 0 ? (
            <p className="text-gray-500 text-center py-8 dark:text-slate-300">{t("Aucun budget défini. Commencez par en créer un !")}</p>
          ) : (
            <BudgetCard />
          )}
        </div>
      </div>
    </div>
  );
}
