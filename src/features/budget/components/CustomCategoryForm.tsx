"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";

export default function CustomCategoryForm() {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const { addCustomCategory } = useBudget();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    budget: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.budget > 0) {
      try {
        addCustomCategory(formData.name.trim(), formData.budget);
      } catch (error) {
        setError((error as Error).message);
        return;
      }
      setError("");
      setFormData({ name: "", budget: 0 });
    }
  };

  return (
    <div className="ui-card">
      <h2 className="text-xl font-semibold mb-4">{t("Nouveau Projet")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-300">
            {t(error)}
          </p>
        )}
        <input
          type="text"
          placeholder={t("Nom du projet")}
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder={`Budget total (${currency})`}
          className="w-full p-2 border rounded"
          value={formData.budget || ""}
          onChange={(e) =>
            setFormData({ ...formData, budget: e.target.valueAsNumber })
          }
          min="0.01"
          step="0.01"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary"
        >{t("Créer le Projet")}</button>
      </form>
    </div>
  );
}
