"use client";
import BankLoanFields from "./BankLoanFields";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Dialog } from "@headlessui/react";
import { Credit } from "@/features/credits/types";
import { useEffect, useState } from "react";

export default function EditCreditModal({
  isOpen,
  onClose,
  credit,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  credit: Credit;
  onSave: (updated: Credit) => Promise<void>;
}) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [formData, setFormData] = useState<Credit>(credit);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(credit);
  }, [credit]);

  const saveForm = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    setError("");
    onClose();
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
            {t("Modifier le Crédit")}
          </Dialog.Title>

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
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>{t("Type")}</label>
              <select
                disabled={!!formData.bankLoan}
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "borrowed" | "lent",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="borrowed">{t("Emprunt")}</option>
                <option value="lent">{t("Prêt")}</option>
              </select>
            </div>

            <div>
              <label>
                {t("Montant initial (")}
                {currency})
              </label>
              <AmountInput
                type="number"
                value={formData.initialAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialAmount: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label>{t("Date de début")}</label>
              <DateInput
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>{t("Date de fin (optionnel)")}</label>
              <DateInput
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                min={formData.startDate}
              />
            </div>
            {formData.bankLoan && (
              <BankLoanFields
                value={formData.bankLoan}
                change={(bankLoan) => setFormData({ ...formData, bankLoan })}
                startDate={formData.startDate}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
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
              {t("Sauvegarder")}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
