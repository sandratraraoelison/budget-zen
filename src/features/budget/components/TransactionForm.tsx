"use client";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { fr, enUS } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { Transaction, TransactionCategory } from "@/features/budget/types";
import {
  TRANSACTION_CATEGORIES,
  getCategoryLabel,
} from "@/features/budget/domain/categorization";
import { subtractAmounts, sumAmounts, toMinor } from "@/shared/domain/money";

export default function TransactionForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { t, language } = useLocale();
  const { currency, formatMoney } = useCurrency();
  const { state, addTransaction, pending } = useBudget();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "expense",
    date: new Date(),
    amount: 0,
    category: undefined,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setSuccess("");

    if (!formData.category || !formData.amount) {
      setError(t("Veuillez sélectionner une catégorie et saisir un montant"));
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: Number(formData.amount),
      date: formData.date || new Date(),
      description: formData.description || getCategoryLabel(formData.category),
      category: formData.category,
      type: formData.type || "expense",
    };
    try {
      toMinor(newTransaction.amount);
    } catch (error) {
      setError((error as Error).message);
      return;
    }

    // Budget Verificcation
    if (newTransaction.type === "expense") {
      const relatedBudget = state.budgets.find(
        (b) => b.category === newTransaction.category,
      );

      if (relatedBudget) {
        const projectedTotal = sumAmounts([
          relatedBudget.current,
          newTransaction.amount,
        ]);
        const remainingBudget = subtractAmounts(
          relatedBudget.limit,
          relatedBudget.current,
        );

        if (projectedTotal > relatedBudget.limit) {
          const confirmMessage = [
            t("⚠️ Attention : Cette transaction dépasse le budget {category} !", { category: t(getCategoryLabel(relatedBudget.category)) }),
            "",
            t("Limite actuelle : {amount}", { amount: formatMoney(relatedBudget.limit) }),
            t("Dépense actuelle : {amount}", { amount: formatMoney(relatedBudget.current) }),
            t("Nouveau total : {amount}", { amount: formatMoney(projectedTotal) }),
            "",
            t("Confirmez-vous cette dépense ?"),
          ].join("\n");

          if (!confirm(confirmMessage)) return;
        } else if (
          remainingBudget - newTransaction.amount < relatedBudget.limit * 0.1 &&
          remainingBudget - newTransaction.amount > 0
        ) {
          alert(
            t("⚠️ Il restera seulement {amount} dans le budget {category}", { amount: formatMoney(remainingBudget - newTransaction.amount), category: t(getCategoryLabel(relatedBudget.category)) }),
          );
        }
      }
    }

    try {
      await addTransaction(newTransaction);
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    setError("");
    setSuccess(t("Transaction ajoutée à votre historique."));

    // Reset Form
    setFormData({
      type: "expense",
      date: new Date(),
      amount: 0,
      category: undefined,
      description: "",
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <p
          role="status"
          className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-300"
        >
          {t(success)}
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-600 mb-4 dark:text-red-300">
          {t(error)}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="transaction-type"
            className="block text-sm font-medium mb-1"
          >{t("Type")}</label>
          <select
            id="transaction-type"
            className="w-full p-2 border rounded"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "income" | "expense",
              })
            }
          >
            <option value="expense">{t("Dépense")}</option>
            <option value="income">{t("Revenu")}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-date"
            className="block text-sm font-medium mb-1"
          >{t("Date")}</label>
          <DatePicker
            locale={language === "fr" ? fr : enUS}
            id="transaction-date"
            selected={formData.date}
            onChange={(date) =>
              setFormData({ ...formData, date: date || new Date() })
            }
            className="w-full p-2 border rounded"
            dateFormat={language === "fr" ? "dd/MM/yyyy" : "MM/dd/yyyy"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="transaction-category"
            className="block text-sm font-medium mb-1"
          >{t("Catégorie")}</label>
          <select
            id="transaction-category"
            className="w-full p-2 border rounded"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as TransactionCategory,
              })
            }
            required
          >
            <option value="">{t("Sélectionnez une catégorie")}</option>
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(getCategoryLabel(category))}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-amount"
            className="block text-sm font-medium mb-1"
          >{t("Montant (")}{currency})
          </label>
          <AmountInput
            id="transaction-amount"
            type="number"
            className="w-full p-2 border rounded"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.valueAsNumber,
              })
            }
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="transaction-description"
          className="block text-sm font-medium mb-1"
        >{t("Description (optionnel)")}</label>
        <input
          id="transaction-description"
          type="text"
          className="w-full p-2 border rounded"
          placeholder={t("Ajouter une description...")}
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />
      </div>

      <button type="submit" disabled={pending} className="ui-primary w-full">{t("Ajouter la transaction")}</button>
    </form>
  );
}
