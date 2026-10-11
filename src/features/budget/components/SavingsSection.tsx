"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useBudget } from "../context/BudgetProvider";
import type { SavingsGoal } from "../types";
import SavingsGoalCard from "./SavingsGoalCard";
export function savingsDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function SavingsSection() {
  const { t } = useLocale();
  const {
    state,
    saveSavingsGoal,
    contributeSavings,
    removeSavingsGoal,
    pending,
  } = useBudget();
  const [form, setForm] = useState<{
    mode: "create" | "edit" | "add" | "withdraw";
    goal?: SavingsGoal;
  } | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function open(
    mode: "create" | "edit" | "add" | "withdraw",
    goal?: SavingsGoal,
  ) {
    setError("");
    setAmount("");
    setName(goal?.name ?? "");
    setTarget(goal ? String(goal.target) : "");
    setDate(goal ? savingsDate(goal.deadline) : "");
    setForm({ mode, goal });
  }
  async function save() {
    if (!form || busy) return;
    setBusy(true);
    setError("");
    try {
      if (form.mode === "create" || form.mode === "edit") {
        if (!name.trim() || !date || !Number.isFinite(Date.parse(date)))
          throw new Error(t("Complétez les champs obligatoires."));
        await saveSavingsGoal(
          {
            id: form.goal?.id ?? crypto.randomUUID(),
            name: name.trim(),
            target: Number(target),
            current: form.goal?.current ?? 0,
            deadline: new Date(`${date}T00:00:00`),
          },
          form.mode === "create",
        );
      } else await contributeSavings(form.goal!.id, Number(amount), form.mode);
      setForm(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ui-card" aria-labelledby="savings-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="savings-heading" className="ui-title">
          {t("Objectifs d’épargne")}
        </h2>
        <button
          disabled={pending}
          onClick={() => open("create")}
          className="ui-primary"
        >
          {t("+ Objectif")}
        </button>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {t("Suivez les sommes déjà mises de côté.")}
      </p>
      {!state.savingsGoals.length && (
        <p className="text-sm text-slate-500">
          {t("Vos objectifs prennent forme ici")}
        </p>
      )}
      <div className="space-y-3">
        {state.savingsGoals.map((goal) => (
          <SavingsGoalCard
            key={goal.id}
            goal={goal}
            disabled={pending}
            edit={() => open("edit", goal)}
            contribute={(direction) => open(direction, goal)}
            remove={() => {
              if (window.confirm(t("Supprimer cet objectif d’épargne ?")))
                void removeSavingsGoal(goal.id).catch((error) =>
                  setError(error.message),
                );
            }}
          />
        ))}
      </div>
      {error && !form && (
        <p role="alert" className="mt-2 text-red-500">
          {error}
        </p>
      )}
      <Dialog
        open={!!form}
        onClose={() => {
          if (!busy) setForm(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="ui-dialog w-full max-w-md space-y-4 p-6">
            <Dialog.Title className="text-xl font-semibold">
              {t(
                form?.mode === "create"
                  ? "Nouvel objectif d’épargne"
                  : form?.mode === "edit"
                    ? "Modifier l’objectif"
                    : form?.mode === "withdraw"
                      ? "Retirer de l’épargne"
                      : "Ajouter à l’épargne",
              )}
            </Dialog.Title>
            {form?.goal && <p>{form.goal.name}</p>}
            {form?.mode === "create" || form?.mode === "edit" ? (
              <>
                <label className="block">
                  {t("Nom")}
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    disabled={busy}
                    className="w-full rounded border p-2"
                  />
                </label>
                <label className="block">
                  {t("Montant cible")}
                  <AmountInput
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={busy}
                    className="w-full rounded border p-2"
                  />
                </label>
                <label className="block">
                  {t("Date cible")}
                  <DateInput
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={busy}
                    className="w-full rounded border p-2"
                  />
                </label>
              </>
            ) : (
              <label className="block">
                {t("Montant")}
                <AmountInput
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={busy}
                  className="w-full rounded border p-2"
                />
              </label>
            )}
            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button disabled={busy} onClick={() => setForm(null)}>
                {t("Annuler")}
              </button>
              <button
                disabled={busy}
                onClick={() => void save()}
                className="ui-primary"
              >
                {t("Enregistrer")}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
}
