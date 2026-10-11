"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { Budget } from "@/features/budget/types";
import {
  TRANSACTION_CATEGORIES,
  getCategoryLabel,
} from "../domain/categorization";

export default function BudgetForm() {
  const { currency } = useCurrency();
  const { addBudget, state } = useBudget();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Omit<Budget, "id" | "current">>({
    category: "",
    limit: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || formData.limit <= 0) {
      alert("Veuillez remplir tous les champs correctement");
      return;
    }

    try {
      addBudget({
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Nouveau Budget</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}
        <select
          className="w-full p-2 border rounded"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        >
          <option value="">Choisir une catégorie</option>
          {TRANSACTION_CATEGORIES.filter(
            (category) => !state.budgets.some((b) => b.category === category),
          ).map((category) => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>

        <input
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
        <p className="text-sm text-gray-500">
          La limite s’applique aux dépenses cumulées de cette catégorie.
        </p>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Créer Budget
        </button>
      </form>
    </div>
  );
}
