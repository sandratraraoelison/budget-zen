"use client";

import { useBudget } from "@/context/BudgetProvider";
import { TransactionCategory } from "@/types/budget";
import { useState } from "react";

export default function CustomCategoryDetails({
  categoryId,
}: {
  categoryId: string;
}) {
  const { state, addCustomTransaction } = useBudget();
  const [transactionForm, setTransactionForm] = useState({
    amount: 0,
    description: "",
    date: new Date(),
  });

  const category = state.customCategories.find((c) => c.id === categoryId);

  if (!category) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addCustomTransaction(categoryId, {
            ...transactionForm,
            type: "expense",
            category: category.name.toLowerCase() as TransactionCategory,
          });
          setTransactionForm({ amount: 0, description: "", date: new Date() });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="number"
            placeholder="Montant"
            className="p-2 border rounded"
            value={transactionForm.amount || ""}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                amount: e.target.valueAsNumber,
              })
            }
            required
          />
          <input
            type="text"
            placeholder="Description"
            className="p-2 border rounded"
            value={transactionForm.description}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                description: e.target.value,
              })
            }
            required
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={transactionForm.date.toISOString().split("T")[0]}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                date: new Date(e.target.value),
              })
            }
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter Dépense
        </button>
      </form>
    </div>
  );
}
