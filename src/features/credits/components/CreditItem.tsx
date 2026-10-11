"use client";

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
      return { status: "expired", message: "Échéance dépassée !" };
    }
    if (diffDays <= 7) {
      return {
        status: "warning",
        message: `Échéance dans ${diffDays} jour(s)`,
      };
    }
    return null;
  };

  const dateStatus = getDateStatus();
  const isPaid = localCredit.remainingAmount === 0;

  return (
    <div
      className={`
      bg-white p-6 rounded-lg shadow-md relative
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
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }
      `}
      >
        {isPaid ? "Payé" : "Non payé"}
      </div>

      {/* Alerte date */}
      {dateStatus && (
        <div
          className={`
          mb-4 p-3 rounded-lg flex items-center gap-2
          ${
            dateStatus.status === "expired"
              ? "bg-red-100 text-red-800"
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
            {localCredit.type === "borrowed" ? "À : " : "De : "}
            <span className="text-primary">{localCredit.contact}</span>
          </h3>

          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              Initial:{" "}
              <span className="font-medium">
                {formatMoney(localCredit.initialAmount)}
              </span>
            </p>
            <p
              className={`text-lg ${
                localCredit.remainingAmount > 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              Restant: {formatMoney(localCredit.remainingAmount)}
            </p>
            <p className="text-sm text-gray-500">
              Début:{" "}
              {new Date(localCredit.startDate).toLocaleDateString("fr-FR")}
              {localCredit.endDate &&
                ` • Fin: ${new Date(localCredit.endDate).toLocaleDateString(
                  "fr-FR",
                )}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isPaid}
            className="text-green-600 hover:text-green-700"
            title="Ajouter un paiement"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700"
            title="Modifier"
          >
            <PencilIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onDelete(localCredit.id)}
            className="text-red-600 hover:text-red-700"
            title="Supprimer"
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
          <h4 className="font-semibold mb-3">Historique des paiements :</h4>
          <div className="space-y-2">
            {localCredit.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    - {formatMoney(payment.amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(payment.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {payment.note && (
                  <p className="text-sm text-gray-600 max-w-[40%] truncate">
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
