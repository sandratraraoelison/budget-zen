"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Credit, Payment } from "@/features/credits/types";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import AddPaymentModal from "./AddPaymentModal";
import EditCreditModal from "./EditCreditModal";
import { useState, useEffect } from "react";
import {
  getCreditStatus,
  reconcileCredit,
  recordPayment,
} from "../domain/credit";

export default function CreditItem({
  credit,
  onUpdate,
  onDelete,
}: {
  credit: Credit;
  onUpdate: (updated: Credit) => void;
  onDelete: (id: string) => void;
}) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [localCredit, setLocalCredit] = useState<Credit>(credit);

  useEffect(() => {
    setLocalCredit(credit);
  }, [credit]);

  const addPayment = (payment: Omit<Payment, "id">) => {
    const updated = recordPayment(localCredit, {
      ...payment,
      id: crypto.randomUUID(),
    });
    onUpdate(updated);
  };

  const handleSave = (updatedCredit: Credit) => {
    const updated = reconcileCredit({
      ...updatedCredit,
      payments: localCredit.payments,
    });
    onUpdate(updated);
    setIsEditing(false);
  };

  const getDateStatus = () => {
    const status = getCreditStatus(localCredit);
    if (status === "paid" || status === "unpaid" || !localCredit.endDate)
      return null;

    const today = new Date(new Date().toISOString().slice(0, 10));
    const endDate = new Date(localCredit.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === "expired") {
      return { status: "expired", message: t("Échéance dépassée !") };
    }
    if (diffDays <= 7) {
      return {
        status: "warning",
        message: t("Échéance dans {days} jour(s)", { days: diffDays }),
      };
    }
    return null;
  };

  const dateStatus = getDateStatus();
  const isPaid = localCredit.remainingAmount === 0;

  return (
    <div
      className={`
      ui-card relative
      ${
        localCredit.type === "borrowed"
          ? "border-l-4 border-red-500"
          : "border-l-4 border-green-500"
      }
    `}
    >
      {/* Badge statut paiement */}
      <div
        className={`
        absolute -top-3 right-2 px-3 py-1 rounded-full text-sm font-medium
        ${
          isPaid
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            : "bg-yellow-100 text-yellow-800"
        }
      `}
      >
        {isPaid ? t("Payé") : t("Non payé")}
      </div>

      {/* Alerte date */}
      {dateStatus && (
        <div
          className={`
          mb-4 p-3 rounded-lg flex items-center gap-2
          ${
            dateStatus.status === "expired"
              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              : "bg-yellow-100 text-yellow-800"
          }
        `}
        >
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm">{dateStatus.message}</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="pr-8">
          <h3 className="text-xl font-semibold">
            {localCredit.type === "borrowed" ? t("À : ") : t("De : ")}
            <span className="text-primary">{localCredit.contact}</span>
          </h3>

          <div className="mt-2 space-y-1">
            <p className="text-gray-600 dark:text-slate-300">{t("Initial:")}{" "}
              <span className="font-medium">
                {formatMoney(localCredit.initialAmount)}
              </span>
            </p>
            <p
              className={`text-lg ${
                localCredit.remainingAmount > 0
                  ? "text-red-600 dark:text-red-300"
                  : "text-green-600 dark:text-green-300"
              }`}
            >{t("Restant:")}{formatMoney(localCredit.remainingAmount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-300">{t("Début:")}{" "}
              {new Date(localCredit.startDate).toLocaleDateString(locale)}
              {localCredit.endDate &&
                ` • ${t("Fin:")} ${new Date(localCredit.endDate).toLocaleDateString(locale,
                )}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isPaid}
            className="text-green-600 hover:text-green-700 dark:text-green-300 dark:hover:text-green-300"
            title={t("Ajouter un paiement")}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-300"
            title="Modifier"
          >
            <PencilIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onDelete(localCredit.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-300"
            title={t("Supprimer")}
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <EditCreditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        credit={localCredit}
        onSave={handleSave}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={addPayment}
        maxAmount={localCredit.remainingAmount}
        minDate={localCredit.startDate}
      />

      {localCredit.payments.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-3">{t("Historique des paiements :")}</h4>
          <div className="space-y-2">
            {localCredit.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-slate-950"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-slate-100">
                    - {formatMoney(payment.amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 dark:text-slate-300">
                    {new Date(payment.date).toLocaleDateString(locale)}
                  </p>
                </div>
                {payment.note && (
                  <p className="text-sm text-gray-600 max-w-[40%] truncate dark:text-slate-300">
                    {payment.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
