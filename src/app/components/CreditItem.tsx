"use client";

import { Credit, Payment } from "@/types/credit";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
// import {
//   ArrowDownCircleIcon,
//   ArrowUpCircleIcon,
// } from "@heroicons/react/24/solid";
import AddPaymentModal from "./AddPaymentModal";
import { useState } from "react";

export default function CreditItem({
  credit,
  onUpdate,
  onDelete,
}: {
  credit: Credit;
  onUpdate: (updated: Credit) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment = { ...payment, id: Math.random().toString() };
    const updated = {
      ...credit,
      remainingAmount: credit.remainingAmount - payment.amount,
      payments: [...credit.payments, newPayment],
    };
    onUpdate(updated);
  };

  const handleEdit = () => {
    console.log("Édition du crédit:", credit.id);
    setIsEditing(true);
  };

  return (
    <div
      className={`
      bg-white p-6 rounded-lg shadow-md relative
      ${
        credit.type === "borrowed"
          ? "border-l-4 border-red-500"
          : "border-l-4 border-green-500"
      }
    `}
    >
      {/* Badge type */}
      <div
        className={`
        absolute -top-3 -left-3 px-3 py-1 rounded-full text-sm font-medium
        ${
          credit.type === "borrowed"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
        }
      `}
      >
        {credit.type === "borrowed" ? "Emprunt" : "Prêt"}
      </div>

      {/* Icône */}
      {/* <div className="absolute top-4 right-4">
        {credit.type === "borrowed" ? (
          <ArrowDownCircleIcon className="w-8 h-8 text-red-500 bg-white rounded-full p-1 shadow-sm" />
        ) : (
          <ArrowUpCircleIcon className="w-8 h-8 text-green-500 bg-white rounded-full p-1 shadow-sm" />
        )}
      </div> */}

      <div className="flex justify-between items-start mb-4">
        <div className="pr-8">
          <h3 className="text-xl font-semibold">
            {credit.type === "borrowed" ? "À : " : "De : "}
            <span className="text-primary">{credit.contact}</span>
          </h3>

          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              Initial:{" "}
              <span className="font-medium">
                {credit.initialAmount.toFixed(2)}MGA
              </span>
            </p>
            <p
              className={`text-lg ${
                credit.remainingAmount > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              Restant: {credit.remainingAmount.toFixed(2)}MGA
            </p>
            <p className="text-sm text-gray-500">
              Début: {new Date(credit.startDate).toLocaleDateString("fr-FR")}
              {credit.endDate &&
                ` • Fin: ${new Date(credit.endDate).toLocaleDateString(
                  "fr-FR"
                )}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="text-green-600 hover:text-green-700"
            title="Ajouter un paiement"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-700"
            title="Modifier"
          >
            <PencilIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onDelete(credit.id)}
            className="text-red-600 hover:text-red-700"
            title="Supprimer"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={addPayment}
        maxAmount={credit.remainingAmount}
      />

      {credit.payments.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-3">Historique des paiements :</h4>
          <div className="space-y-2">
            {credit.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    - {payment.amount.toFixed(2)}MGA
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(payment.date).toLocaleDateString()}
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
