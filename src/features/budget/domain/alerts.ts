import type { AppState } from "../types";
import { sumAmounts } from "../../../shared/domain/money";

export const generateAlerts = (
  newState: AppState,
  formatMoney = (amount: number) => amount.toFixed(2),
) => {
  const alerts: string[] = [];

  // Calculation of the overall budget
  const totalBudgetLimit = sumAmounts(newState.budgets.map((b) => b.limit));
  const totalBudgetSpent = sumAmounts(newState.budgets.map((b) => b.current));
  const budgetGlobalPercentage =
    totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // Global budget alerts
  if (totalBudgetSpent > totalBudgetLimit) {
    alerts.push(
      `🚨 Budget global dépassé : ${formatMoney(totalBudgetSpent)}/${formatMoney(totalBudgetLimit)}`,
    );
  } else if (budgetGlobalPercentage >= 90) {
    alerts.push(
      `⚠️ Budget global à ${budgetGlobalPercentage.toFixed(
        0,
      )}% : ${formatMoney(totalBudgetSpent)}/${formatMoney(totalBudgetLimit)}`,
    );
  }

  // Standard budget alerts
  newState.budgets.forEach((budget) => {
    const spent = budget.current;

    if (spent > budget.limit) {
      alerts.push(
        `Dépassement du budget ${budget.category} (${formatMoney(spent)}/${formatMoney(budget.limit)})`,
      );
    } else if (spent >= budget.limit * 0.75) {
      alerts.push(`Attention : 75% du budget ${budget.category} utilisé`);
    }
  });

  // Custom project alerts
  newState.customCategories.forEach((category) => {
    if (category.spent > category.budget) {
      alerts.push(
        `Dépassement du projet ${category.name} (${formatMoney(category.spent)}/${formatMoney(category.budget)})`,
      );
    } else if (category.spent >= category.budget * 0.9) {
      alerts.push(`Attention : 90% du budget ${category.name} utilisé`);
    }
  });

  return alerts;
};
