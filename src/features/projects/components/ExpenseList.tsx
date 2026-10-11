"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import NewExpenseModal from "./NewExpenseModal";
import { Project, Expense } from "@/features/projects/types";
import { recordExpense } from "../domain/project";

type ExpenseListProps = {
  project: Project;
  setProjects: (update: React.SetStateAction<Project[]>) => Promise<void>;
};

export default function ExpenseList({
  project,
  setProjects,
}: ExpenseListProps) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const updated = recordExpense(project, {
      ...expense,
      id: crypto.randomUUID(),
    });
    await setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? updated : p)),
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">{t("Dépenses")}</h4>
        <button
          disabled={project.status !== "en-cours" || project.currentFund === 0}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-primary hover:text-secondary"
        >
          <PlusIcon className="w-5 h-5" />
          {t("Ajouter une dépense")}
        </button>
      </div>

      <div className="space-y-2">
        {project.expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex justify-between p-3 bg-gray-50 rounded dark:bg-slate-950"
          >
            <div>
              <p className="font-medium">{expense.description}</p>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                {new Date(`${expense.date}T00:00:00`).toLocaleDateString(
                  locale,
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-red-600 dark:text-red-300">
                -{formatMoney(expense.amount)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                {t(expense.category)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <NewExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addExpense}
      />
    </div>
  );
}
