"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSave,
  maxAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: { amount: number; date: string; note: string }) => void;
  maxAmount: number;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= maxAmount) {
      onSave({ amount: amountNum, date, note });
      setAmount("");
      setNote("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Ajouter un paiement
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label>Montant (max {maxAmount.toFixed(2)}MGA)</label>
              <input
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
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label>Note (optionnel)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-500">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
            >
              Enregistrer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
