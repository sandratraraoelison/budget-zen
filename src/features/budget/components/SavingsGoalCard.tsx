"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { SavingsGoal } from "@/features/budget/types";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
}

export default function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const progress =
    goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  const daysLeft = Math.ceil(
    (goal.deadline.getTime() - Date.now()) / (1000 * 3600 * 24),
  );

  return (
    <div className="p-4 border rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{goal.name}</h3>
        <span className="text-sm text-gray-500 dark:text-slate-300">
          {goal.current >= goal.target
            ? t("Objectif atteint")
            : daysLeft < 0
              ? t("Échéance dépassée")
              : `${daysLeft} jours restants`}
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between text-sm mt-2">
        <span>{formatMoney(goal.current)}</span>
        <span>{formatMoney(goal.target)}</span>
      </div>
    </div>
  );
}
