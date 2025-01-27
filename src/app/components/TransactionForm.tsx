"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBudget } from "@/context/BudgetProvider";
import { Transaction, TransactionCategory } from "@/types/budget";
import {
  TRANSACTION_CATEGORIES,
  getCategoryLabel,
} from "@/utils/categorization";

export default function TransactionForm() {
  const { state, addTransaction } = useBudget();
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "expense",
    date: new Date(),
    amount: 0,
    category: undefined,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.amount) {
      alert("Veuillez sélectionner une catégorie et saisir un montant");
      return;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(),
      amount: Number(formData.amount),
      date: formData.date || new Date(),
      description: formData.description || getCategoryLabel(formData.category),
      category: formData.category,
      type: formData.type || "expense",
    };

    // Budget Verificcation
    if (newTransaction.type === "expense") {
      const relatedBudget = state.budgets.find(
        (b) => b.category === newTransaction.category
      );

      if (relatedBudget) {
        const projectedTotal = relatedBudget.current + newTransaction.amount;
        const remainingBudget = relatedBudget.limit - relatedBudget.current;

        if (projectedTotal > relatedBudget.limit) {
          const confirmMessage =
            `⚠️ Attention : Cette transaction dépasse le budget ${relatedBudget.category} !\n\n` +
            `Limite actuelle : ${relatedBudget.limit.toFixed(2)}MGA\n` +
            `Dépense actuelle : ${relatedBudget.current.toFixed(2)}MGA\n` +
            `Nouveau total : ${projectedTotal.toFixed(2)}MGA\n\n` +
            `Confirmez-vous cette dépense ?`;

          if (!confirm(confirmMessage)) return;
        } else if (
          remainingBudget - newTransaction.amount < 50 &&
          remainingBudget - newTransaction.amount > 0
        ) {
          alert(
            `⚠️ Il restera seulement ${(
              remainingBudget - newTransaction.amount
            ).toFixed(2)}MGA dans le budget ${relatedBudget.category}`
          );
        }
      }
    }

    addTransaction(newTransaction);

    // Reset Form
    setFormData({
      type: "expense",
      date: new Date(),
      amount: 0,
      category: undefined,
      description: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "income" | "expense",
              })
            }
          >
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <DatePicker
            selected={formData.date}
            onChange={(date) =>
              setFormData({ ...formData, date: date || new Date() })
            }
            className="w-full p-2 border rounded"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as TransactionCategory,
              })
            }
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Montant (MGA)
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.valueAsNumber,
              })
            }
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Description (optionnel)
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Ajouter une description..."
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors"
      >
        Ajouter la transaction
      </button>
    </form>
  );
}
