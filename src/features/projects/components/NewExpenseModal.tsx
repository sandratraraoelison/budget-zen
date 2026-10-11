"use client";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

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
  }) => Promise<void>;
}

export default function NewExpenseModal({
  isOpen,
  onClose,
  onSave,
}: NewExpenseModalProps) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const saveForm = async () => {
    if (description && amount && category) {
      try {
        await onSave({
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

  const handleSubmit = async () => {
    if (pending) return;
    setPending(true);
    try {
      await saveForm();
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog bg-white p-6 w-full max-w-md dark:bg-slate-900">
          <Dialog.Title className="text-xl font-bold mb-4">
            {t("Nouvelle Dépense")}
          </Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-300">
                {t(error)}
              </p>
            )}
            <div>
              <label className="block mb-1">{t("Description")}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">
                {t("Montant (")}
                {currency})
              </label>
              <AmountInput
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
              <label className="block mb-1">{t("Catégorie")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">{t("Sélectionnez une catégorie")}</option>
                {categories.map((cat) => (
                  <option key={t(cat)} value={t(cat)}>
                    {t(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">{t("Date")}</label>
              <DateInput
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
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {t("Annuler")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="ui-primary"
            >
              {t("Ajouter")}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
