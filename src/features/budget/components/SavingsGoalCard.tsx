"use client";
import FundingHistory from "./FundingHistory";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "../types";
import { savingsPlan } from "../domain/savings";
function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function SavingsGoalCard({
  goal,
  edit,
  contribute,
  remove,
  disabled,
}: {
  goal: SavingsGoal;
  edit(): void;
  contribute(direction: "add" | "withdraw"): void;
  remove(): void;
  disabled: boolean;
}) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const plan = savingsPlan(
    { ...goal, deadline: dateString(goal.deadline) },
    dateString(new Date()),
  );
  return (
    <article className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/30 p-4 dark:border-teal-900 dark:bg-teal-950/20">
      <div className="flex items-start justify-between gap-2">
        <h3 className="break-words font-semibold">{goal.name}</h3>
        <div className="flex shrink-0 gap-1">
          <button
            disabled={disabled}
            onClick={edit}
            aria-label={t("Modifier l’objectif")}
            className="p-2"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            disabled={disabled}
            onClick={remove}
            aria-label={t("Supprimer")}
            className="p-2 text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <strong className="text-teal-700 dark:text-teal-300">
          {formatMoney(goal.current)}
        </strong>
        <span>{formatMoney(goal.target)}</span>
      </div>
      <Progress value={plan.progress} className="h-2" />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {Math.round(plan.progress)} % ·{" "}
        {goal.deadline.toLocaleDateString(locale)}
      </p>
      <p className="text-sm">
        {plan.achieved
          ? t("Objectif atteint")
          : plan.days < 0
            ? t("Échéance dépassée")
            : plan.days === 0
              ? t("C’est aujourd’hui")
              : t("{days} jours restants", { days: plan.days })}
      </p>
      {!plan.achieved && (
        <p className="text-sm">
          {t("Reste à épargner")} : {formatMoney(plan.remaining)}
          {plan.monthly !== undefined && (
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {t("Rythme mensuel estimé")} : {formatMoney(plan.monthly)}
            </span>
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          disabled={disabled}
          onClick={() => contribute("add")}
          className="ui-primary"
        >
          {t("Ajouter")}
        </button>
        <button
          disabled={disabled || goal.current === 0}
          onClick={() => contribute("withdraw")}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
        >
          {t("Retirer")}
        </button>
      </div>
      <FundingHistory entries={goal.history ?? []} />
    </article>
  );
}
