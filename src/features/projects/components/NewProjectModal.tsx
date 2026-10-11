"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: {
    name: string;
    initialFund: number;
    startDate?: string;
  }) => void;
};

export default function NewProjectModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [initialFund, setInitialFund] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = () => {
    if (name && initialFund) {
      onSave({
        name,
        initialFund: parseFloat(initialFund),
        startDate: startDate || undefined,
      });
      setName("");
      setInitialFund("");
      setStartDate("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Nouveau Projet
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block mb-1">Nom du projet *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Budget initial (MGA) *</label>
              <input
                type="number"
                value={initialFund}
                onChange={(e) => setInitialFund(e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Date de commencement</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded"
                max={new Date().toISOString().split("T")[0]}
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
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary disabled:opacity-50"
              disabled={!name || !initialFund}
            >
              Créer le projet
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
