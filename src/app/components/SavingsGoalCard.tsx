"use client";

import { SavingsGoal } from "@/types/budget";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
}

export default function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
  const progress = (goal.current / goal.target) * 100;
  const daysLeft = Math.ceil(
    (goal.deadline.getTime() - Date.now()) / (1000 * 3600 * 24)
  );

  return (
    <div className="p-4 border rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{goal.name}</h3>
        <span className="text-sm text-gray-500">{daysLeft} jours restants</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between text-sm mt-2">
        <span>{goal.current.toFixed(2)}MGA</span>
        <span>{goal.target.toFixed(2)}MGA</span>
      </div>
    </div>
  );
}
