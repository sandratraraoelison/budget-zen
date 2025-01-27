"use client";

import { useState } from "react";
import { useBudget } from "@/context/BudgetProvider";
import { Budget } from "@/types/budget";

export default function BudgetForm() {
  const { addBudget } = useBudget();
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

    addBudget({
      ...formData,
      id: Math.random().toString(),
      current: 0,
    });

    setFormData({ category: "", limit: 0 });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Nouveau Budget</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Catégorie (ex: Nourriture)"
          className="w-full p-2 border rounded"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Limite mensuelle (MGA)"
          className="w-full p-2 border rounded"
          value={formData.limit || ""}
          onChange={(e) =>
            setFormData({ ...formData, limit: e.target.valueAsNumber })
          }
          min="1"
          required
        />

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
