"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { Credit, Payment } from "@/features/credits/types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { bankProjection } from "../domain/bank-loan";
import BankLoanDetails from "./BankLoanDetails";
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
  onUpdate: (updated: Credit) => Promise<void>;
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

  const addPayment = async (payment: Omit<Payment, "id">) => {
    const updated = recordPayment(localCredit, {
      ...payment,
      id: crypto.randomUUID(),
    });
    await onUpdate(updated);
  };

  const handleSave = async (updatedCredit: Credit) => {
    const updated = reconcileCredit({
      ...updatedCredit,
      payments: localCredit.payments,
    });
    await onUpdate(updated);
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

  const borrowed = localCredit.type === "borrowed";
  const progress =
    localCredit.initialAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (1 - localCredit.remainingAmount / localCredit.initialAmount) * 100,
          ),
        )
      : 0;
  return (
    <div
      className={`credit-card ${borrowed ? "credit-card--borrowed" : "credit-card--lent"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${borrowed ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"}`}
        >
          <span aria-hidden="true">{borrowed ? "↙" : "↗"}</span>
          {t(
            localCredit.bankLoan
              ? "Crédit bancaire"
              : borrowed
                ? "Emprunt"
                : "Prêt",
          )}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`mr-1 rounded-full px-2 py-1 text-xs font-medium ${isPaid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {isPaid ? t("Payé") : t("Non payé")}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={t("Modifier")}
            aria-label={t("Modifier")}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(localCredit.id)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            title={t("Supprimer")}
            aria-label={t("Supprimer")}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <h3 className="mt-2 break-words text-lg font-semibold text-slate-900 dark:text-slate-100">
        {localCredit.contact}
      </h3>
      <div className="mt-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            borrowed
              ? "Montant restant à rembourser"
              : "Montant restant à récupérer",
          )}
        </p>
        <p
          className={`mt-1 break-words text-2xl font-bold tabular-nums ${borrowed ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}
        >
          {formatMoney(localCredit.remainingAmount)}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("Initial:")} {formatMoney(localCredit.initialAmount)}
          </span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-label={t("Ajouter un paiement")}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full ${borrowed ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t("Début:")}{" "}
        {new Date(localCredit.startDate).toLocaleDateString(locale)}
        {localCredit.endDate &&
          ` • ${t("Fin:")} ${new Date(localCredit.endDate).toLocaleDateString(locale)}`}
      </p>
      {dateStatus && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          {dateStatus.message}
        </div>
      )}
      {!isPaid && (
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className={`mt-4 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors ${borrowed ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {t(borrowed ? "Rembourser" : "Recevoir un remboursement")}
        </button>
      )}

      <BankLoanDetails credit={localCredit} update={handleSave} />
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
        bank={!!localCredit.bankLoan}
        suggestedPayment={
          localCredit.bankLoan
            ? {
                monthly: bankProjection(
                  localCredit.initialAmount,
                  localCredit.bankLoan,
                ).monthlyPayment,
                interest:
                  Math.round(
                    (localCredit.remainingAmount *
                      localCredit.bankLoan.annualRate) /
                      12,
                  ) / 100,
                insurance: localCredit.bankLoan.insuranceMonthly,
              }
            : undefined
        }
        maxAmount={localCredit.remainingAmount}
        minDate={localCredit.startDate}
      />

      {localCredit.payments.length > 0 && (
        <details className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <summary className="cursor-pointer text-sm font-medium">
            {t("Historique des paiements :")}
          </summary>
          <div className="mt-3 space-y-2">
            {localCredit.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-slate-950"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-slate-100">
                    {localCredit.type === "borrowed" ? "−" : "+"}{" "}
                    {formatMoney(payment.amount)}
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
        </details>
      )}
    </div>
  );
}
