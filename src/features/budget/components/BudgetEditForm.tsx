"use client";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { Budget } from "@/features/budget/types";

export default function BudgetEditForm({
  budget,
  onClose,
}: {
  budget: Budget;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const { updateBudget, pending } = useBudget();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Budget>(budget);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    if (formData.limit > 0) {
      try {
        await updateBudget(formData);
      } catch (error) {
        setError((error as Error).message);
        return;
      }
      onClose();
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-2 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-300">
            {t(error)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <label className="text-sm">{t("Nouvelle limite :")}</label>
          <AmountInput
            type="number"
            value={formData.limit}
            onChange={(e) =>
              setFormData({ ...formData, limit: Number(e.target.value) })
            }
            className="p-1 border rounded w-32"
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="submit" disabled={pending}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >{t("Valider")}</button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:bg-slate-800"
          >{t("Annuler")}</button>
        </div>
      </form>
    </div>
  );
}
