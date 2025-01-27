"use client";

import { Dialog } from "@headlessui/react";
import { Credit } from "@/types/credit";
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
  onSave: (updated: Credit) => void;
}) {
  const [formData, setFormData] = useState<Credit>(credit);

  useEffect(() => {
    setFormData(credit);
  }, [credit]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Modifier le Crédit
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label>Contact</label>
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
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "borrowed" | "lent",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="borrowed">Emprunt</option>
                <option value="lent">Prêt</option>
              </select>
            </div>

            <div>
              <label>Montant initial (MGA)</label>
              <input
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
              <label>Date de début</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label>Date de fin (optionnel)</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                min={formData.startDate}
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
              Sauvegarder
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
