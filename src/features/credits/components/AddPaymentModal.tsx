"use client";
import { repaymentAmount, repaymentPercent } from "../domain/repayment";
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
  bank = false,
  suggestedPayment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: {
    amount: number;
    date: string;
    note: string;
    interest?: number;
    insurance?: number;
  }) => Promise<void>;
  maxAmount: number;
  minDate: string;
  bank?: boolean;
  suggestedPayment?: { monthly: number; interest: number; insurance: number };
}) {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const [interest, setInterest] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const saveForm = async () => {
    const amountNum = parseFloat(amount);
    if (
      (amountNum > 0 ||
        (bank &&
          amountNum === 0 &&
          Number(interest) + Number(insurance) > 0)) &&
      amountNum <= maxAmount
    ) {
      try {
        const interestAmount = bank ? Number(interest) : 0;
        const insuranceAmount = bank ? Number(insurance) : 0;
        if (
          !Number.isFinite(interestAmount) ||
          !Number.isFinite(insuranceAmount) ||
          interestAmount < 0 ||
          insuranceAmount < 0 ||
          interestAmount !== Number(interestAmount.toFixed(2)) ||
          insuranceAmount !== Number(insuranceAmount.toFixed(2)) ||
          amountNum !== Number(amountNum.toFixed(2))
        )
          throw new Error(t("Montant bancaire invalide."));
        await onSave({
          amount:
            (Math.round(amountNum * 100) +
              Math.round(interestAmount * 100) +
              Math.round(insuranceAmount * 100)) /
            100,
          date,
          note,
          ...(bank
            ? { interest: interestAmount, insurance: insuranceAmount }
            : {}),
        });
      } catch (error) {
        setError((error as Error).message);
        return;
      }
      setError("");
      setAmount("");
      setNote("");
      setInterest("0");
      setInsurance("0");
      onClose();
    } else
      setError(
        t("Saisissez un montant positif inférieur ou égal au solde restant."),
      );
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
          <Dialog.Title className="text-xl font-bold mb-4">
            {t("Ajouter un paiement")}
          </Dialog.Title>

          <div className="space-y-4">
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-300">
                {t(error)}
              </p>
            )}
            <div className="space-y-3">
              <label htmlFor="payment-percent" className="flex justify-between">
                <span>{t("Part du montant restant")}</span>
                <span>
                  {Math.round(repaymentPercent(maxAmount, Number(amount)))} %
                </span>
              </label>
              <input
                id="payment-percent"
                type="range"
                min="0"
                max="100"
                step="1"
                disabled={pending}
                className="w-full accent-teal-600"
                value={repaymentPercent(maxAmount, Number(amount))}
                onChange={(e) =>
                  setAmount(
                    repaymentAmount(maxAmount, Number(e.target.value)).toFixed(
                      2,
                    ),
                  )
                }
              />
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    disabled={pending}
                    className="flex-1 rounded-lg border p-2 text-sm"
                    onClick={() =>
                      setAmount(repaymentAmount(maxAmount, percent).toFixed(2))
                    }
                  >
                    {percent} %
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("100 % rembourse la totalité du montant restant.")}
              </p>
            </div>
            <div>
              <label>
                {bank ? t("Capital remboursé (max") : t("Montant (max")}
                {formatMoney(maxAmount)})
              </label>
              <AmountInput
                type="number"
                disabled={pending}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                min="0.01"
                max={maxAmount}
                step="0.01"
              />
            </div>
            {suggestedPayment && (
              <button
                type="button"
                disabled={pending}
                className="w-full rounded-lg border p-2 text-sm"
                onClick={() => {
                  setAmount(
                    Math.min(
                      maxAmount,
                      Math.max(
                        0,
                        (Math.round(suggestedPayment.monthly * 100) -
                          Math.round(suggestedPayment.interest * 100) -
                          Math.round(suggestedPayment.insurance * 100)) /
                          100,
                      ),
                    ).toFixed(2),
                  );
                  setInterest(suggestedPayment.interest.toFixed(2));
                  setInsurance(suggestedPayment.insurance.toFixed(2));
                }}
              >
                {t("Préremplir la mensualité estimée")}
              </button>
            )}
            {bank && (
              <div className="grid grid-cols-2 gap-3">
                <label>
                  {t("Intérêts payés")}
                  <AmountInput
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    disabled={pending}
                    className="w-full rounded border p-2"
                  />
                </label>
                <label>
                  {t("Assurance payée")}
                  <AmountInput
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    disabled={pending}
                    className="w-full rounded border p-2"
                  />
                </label>
                <p className="col-span-2 text-sm">
                  {t("Total payé")} :{" "}
                  {formatMoney(
                    (Number(amount) || 0) +
                      (Number(interest) || 0) +
                      (Number(insurance) || 0),
                  )}
                </p>
              </div>
            )}
            <div>
              <label>{t("Date")}</label>
              <DateInput
                disabled={pending}
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label>{t("Note (optionnel)")}</label>
              <textarea
                disabled={pending}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              disabled={pending}
              onClick={onClose}
              className="px-4 py-2 text-gray-500 dark:text-slate-300"
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
