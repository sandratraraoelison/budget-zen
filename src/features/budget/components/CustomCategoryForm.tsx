"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { useBudget } from "@/features/budget/context/BudgetProvider";

export default function CustomCategoryForm() {
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Nouveau Projet</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}
        <input
          type="text"
          placeholder="Nom du projet"
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
        >
          Créer le Projet
        </button>
      </form>
    </div>
  );
}
