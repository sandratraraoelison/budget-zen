"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Dialog } from "@headlessui/react";
import { useState } from "react";

export type CreditInput = {
  contact: string;
  initialAmount: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
};

export default function AddCreditModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credit: CreditInput) => void;
}) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"borrowed" | "lent">("borrowed");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!contact || !amount || !startDate) {
      setError(t("Complétez les champs obligatoires."));
      return;
    }

    try {
      onSave({
        contact,
        initialAmount: parseFloat(amount),
        type,
        startDate,
        endDate: endDate || undefined,
      });
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    setError("");

    // Reset Form
    setContact("");
    setAmount("");
    setType("borrowed");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog bg-white p-6 w-full max-w-md dark:bg-slate-900">
          <Dialog.Title className="text-xl font-bold mb-4">{t("Nouveau Crédit")}</Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-300">
                {t(error)}
              </p>
            )}
            <div>
              <label>{t("Contact")}</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>{t("Type")}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "borrowed" | "lent")}
                className="w-full p-2 border rounded"
              >
                <option value="borrowed">{t("J&apos;ai emprunté")}</option>
                <option value="lent">{t("J&apos;ai prêté")}</option>
              </select>
            </div>

            <div>
              <label>{t("Montant initial (")}{currency})</label>
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
              <label>{t("Date de début")}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>{t("Date de fin (optionnel)")}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded"
                min={startDate}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100"
            >{t("Annuler")}</button>
            <button onClick={handleSubmit} className="ui-primary">{t("Enregistrer")}</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
