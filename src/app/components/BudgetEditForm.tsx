"use client";

import { useState } from "react";
import { useBudget } from "@/context/BudgetProvider";
import { Budget } from "@/types/budget";

export default function BudgetEditForm({
  budget,
  onClose,
}: {
  budget: Budget;
  onClose: () => void;
}) {
  const { updateBudget } = useBudget();
  const [formData, setFormData] = useState<Budget>(budget);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.limit > 0) {
      updateBudget(formData);
      onClose();
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm">Nouvelle limite :</label>
          <input
            type="number"
            value={formData.limit}
            onChange={(e) =>
              setFormData({ ...formData, limit: Number(e.target.value) })
            }
            className="p-1 border rounded w-32"
            min="1"
            step="1"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Valider
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
