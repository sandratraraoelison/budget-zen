"use client";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { categories } from "@/features/projects/domain/categories";

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }) => void;
}

export default function NewExpenseModal({
  isOpen,
  onClose,
  onSave,
}: NewExpenseModalProps) {
  const { currency } = useCurrency();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (description && amount && category) {
      try {
        onSave({
          description,
          amount: Number(amount),
          category,
          date,
        });
      } catch (error) {
        setError((error as Error).message);
        return;
      }
      setError("");
      setDescription("");
      setAmount("");
      setCategory("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog bg-white p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Nouvelle Dépense
          </Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600">
                {error}
              </p>
            )}
            <div>
              <label className="block mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Montant ({currency})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
            <button type="button" onClick={handleSubmit} className="ui-primary">
              Ajouter
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
