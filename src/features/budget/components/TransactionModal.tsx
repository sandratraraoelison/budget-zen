"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

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
  const { t } = useLocale();
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="ui-dialog w-full max-w-xl bg-white p-5 sm:p-6 dark:bg-slate-900">
          <div className="mb-1 flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("Nouvelle transaction")}</Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="ui-icon-button"
              aria-label={t("Fermer le formulaire")}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <Dialog.Description className="mb-5 text-sm leading-6 text-slate-500 dark:text-slate-300">{t("Enregistrez un revenu ou une dépense en quelques secondes.")}</Dialog.Description>
          <TransactionForm onSuccess={onSuccess} />
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >{t("Annuler")}</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
