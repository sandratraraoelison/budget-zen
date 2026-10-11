"use client";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import type { BusinessTransaction } from "../types";
import { toMinor } from "@/shared/domain/money";
import { calendarDay } from "@/shared/domain/dates";

const categories = [
  "Vente produit",
  "Service client",
  "Fournitures",
  "Marketing",
  "Salaires",
  "Autre",
];

export default function AddBusinessTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
}: {
  transaction?: BusinessTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<BusinessTransaction, "id">) => Promise<void>;
}) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type ?? "income",
  );
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [date, setDate] = useState(
    transaction?.date.slice(0, 10) ?? new Date().toISOString().split("T")[0],
  );
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (pending) return;
    setPending(true);
    try {
      toMinor(Number(amount));
      calendarDay(date);
      if (!category) throw new Error(t("Choisissez une catégorie."));

      await onSave({
        type,
        amount: Number(amount),
        date,
        category,
        description: description.trim() || category,
      });

      // Reset form
      setType("income");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setDescription("");
      onClose();
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!pending) onClose();
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog bg-white p-6 w-full max-w-md dark:bg-slate-900">
          <Dialog.Title className="text-xl font-bold mb-4 flex items-center gap-2">
            <PlusCircleIcon className="w-6 h-6 text-primary" />
            {t(
              transaction
                ? "Modifier une opération Business"
                : "Nouvelle Transaction Business",
            )}
          </Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-300">
                {t(error)}
              </p>
            )}
            <div>
              <label>{t("Type de transaction")}</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as BusinessTransaction["type"])
                }
                className="w-full p-2 border rounded mt-1"
              >
                <option value="income">{t("Revenu")}</option>
                <option value="expense">{t("Dépense")}</option>
              </select>
            </div>

            <div>
              <label>
                {t("Montant (")}
                {currency})
              </label>
              <AmountInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label>{t("Date")}</label>
              <DateInput
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>

            <div>
              <label>{t("Catégorie")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="">{t("Sélectionnez une catégorie")}</option>
                {Array.from(
                  new Set([
                    ...categories,
                    ...(transaction?.category ? [transaction.category] : []),
                  ]),
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>{t("Description (optionnel)")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              disabled={pending}
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {t("Annuler")}
            </button>
            <button
              disabled={pending}
              onClick={handleSubmit}
              className="ui-primary"
            >
              {t("Enregistrer")}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
