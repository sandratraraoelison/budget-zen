"use client";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { Budget } from "@/features/budget/types";
import {
  TRANSACTION_CATEGORIES,
  getCategoryLabel,
} from "../domain/categorization";

export default function BudgetForm() {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const { addBudget, state, pending } = useBudget();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Omit<Budget, "id" | "current">>({
    category: "",
    limit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;

    if (!formData.category || formData.limit <= 0) {
      setError(t("Choisissez une catégorie et saisissez une limite positive."));
      return;
    }

    try {
      await addBudget({
        ...formData,
        id: crypto.randomUUID(),
        current: 0,
      });
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    setError("");

    setFormData({ category: "", limit: 0 });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-300">
            {t(error)}
          </p>
        )}
        <label htmlFor="budget-category" className="block">{t("Catégorie")}</label>
        <select
          id="budget-category"
          className="w-full p-2 border rounded"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        >
          <option value="">{t("Choisir une catégorie")}</option>
          {TRANSACTION_CATEGORIES.filter(
            (category) => !state.budgets.some((b) => b.category === category),
          ).map((category) => (
            <option key={category} value={category}>
              {t(getCategoryLabel(category))}
            </option>
          ))}
        </select>

        <label htmlFor="budget-limit" className="block">{t("Limite (")}{currency})
        </label>
        <AmountInput
          id="budget-limit"
          type="number"
          placeholder={`Limite du budget (${currency})`}
          className="w-full p-2 border rounded"
          value={formData.limit || ""}
          onChange={(e) =>
            setFormData({ ...formData, limit: e.target.valueAsNumber })
          }
          min="0.01"
          step="0.01"
          required
        />
        <p className="text-sm text-gray-500 dark:text-slate-300">{t("La limite s’applique aux dépenses cumulées de cette catégorie.")}</p>

        <button type="submit" disabled={pending} className="ui-primary w-full">{t("Créer le budget")}</button>
      </form>
    </div>
  );
}
