"use client";

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
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"borrowed" | "lent">("borrowed");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");

  const handleSubmit = () => {
    if (!contact || !amount || !startDate) return;

    onSave({
      contact,
      initialAmount: parseFloat(amount),
      type,
      startDate,
      endDate: endDate || undefined,
    });

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
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Nouveau Crédit
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label>Contact</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "borrowed" | "lent")}
                className="w-full p-2 border rounded"
              >
                <option value="borrowed">J'ai emprunté</option>
                <option value="lent">J'ai prêté</option>
              </select>
            </div>

            <div>
              <label>Montant initial (MGA)</label>
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
              <label>Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>Date de fin (optionnel)</label>
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
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
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
