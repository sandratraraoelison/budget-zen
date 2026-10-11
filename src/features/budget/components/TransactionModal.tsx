"use client";

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import TransactionForm from "./TransactionForm";

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog w-full max-w-xl bg-white p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              Nouvelle transaction
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="ui-icon-button"
              aria-label="Fermer le formulaire"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <Dialog.Description className="mb-5 text-sm leading-6 text-slate-500">
            Enregistrez un revenu ou une dépense en quelques secondes.
          </Dialog.Description>
          <TransactionForm onSuccess={onSuccess} />
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Annuler
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
