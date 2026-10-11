"use client";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Dialog } from "@headlessui/react";
import { useState } from "react";

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSave,
  maxAmount,
  minDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: { amount: number; date: string; note: string }) => Promise<void>;
  maxAmount: number;
  minDate: string;
}) {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const saveForm = async () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= maxAmount) {
      try {
        await onSave({ amount: amountNum, date, note });
      } catch (error) {
        setError((error as Error).message);
        return;
      }
      setError("");
      setAmount("");
      setNote("");
      onClose();
    } else
      setError(
        t("Saisissez un montant positif inférieur ou égal au solde restant."),
      );
  };

  const handleSubmit = async () => {
    if (pending) return;
    setPending(true);
    try { await saveForm(); } finally { setPending(false); }
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog bg-white p-6 w-full max-w-md dark:bg-slate-900">
          <Dialog.Title className="text-xl font-bold mb-4">{t("Ajouter un paiement")}</Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-300">
                {t(error)}
              </p>
            )}
            <div>
              <label>{t("Montant (max")}{formatMoney(maxAmount)})</label>
              <AmountInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                min="0.01"
                max={maxAmount}
                step="0.01"
              />
            </div>
            <div>
              <label>{t("Date")}</label>
              <DateInput
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label>{t("Note (optionnel)")}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-500 dark:text-slate-300">{t("Annuler")}</button>
            <button disabled={pending} onClick={handleSubmit} className="ui-primary">{t("Enregistrer")}</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
