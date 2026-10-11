"use client";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useBudget } from "@/features/budget/context/BudgetProvider";
import { TransactionCategory } from "@/features/budget/types";
import { useState } from "react";

export default function CustomCategoryDetails({
  categoryId,
}: {
  categoryId: string;
}) {
  const { t } = useLocale();
  const { state, addCustomTransaction, pending } = useBudget();
  const [error, setError] = useState("");
  const [transactionForm, setTransactionForm] = useState({
    amount: 0,
    description: "",
    date: new Date(),
  });

  const category = state.customCategories.find((c) => c.id === categoryId);

  if (!category) return null;

  return (
    <div className="ui-card">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
    if (pending) return;
          try {
            await addCustomTransaction(categoryId, {
              ...transactionForm,
              type: "expense",
              category: "autres" as TransactionCategory,
            });
          } catch (error) {
            setError((error as Error).message);
            return;
          }
          setError("");
          setTransactionForm({ amount: 0, description: "", date: new Date() });
        }}
      >
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-300">
            {t(error)}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <AmountInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Montant"
            className="p-2 border rounded"
            value={transactionForm.amount || ""}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                amount: e.target.valueAsNumber,
              })
            }
            required
          />
          <input
            type="text"
            placeholder={t("Description")}
            className="p-2 border rounded"
            value={transactionForm.description}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                description: e.target.value,
              })
            }
            required
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={transactionForm.date.toISOString().split("T")[0]}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                date: e.target.value
                  ? new Date(e.target.value)
                  : transactionForm.date,
              })
            }
            required
          />
        </div>
        <button
          type="submit" disabled={pending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >{t("Ajouter Dépense")}</button>
      </form>
    </div>
  );
}
