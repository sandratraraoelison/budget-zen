import type { AppState } from "../types";
import { sumAmounts } from "../../../shared/domain/money";

export const generateAlerts = (
  newState: AppState,
  formatMoney = (amount: number) => amount.toFixed(2),
  message = (text: string, values: Record<string, string | number>) =>
    text.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match)),
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
      message("🚨 Budget global dépassé : {spent}/{limit}", { spent: formatMoney(totalBudgetSpent), limit: formatMoney(totalBudgetLimit) }),
    );
  } else if (budgetGlobalPercentage >= 90) {
    alerts.push(
      message("⚠️ Budget global à {percentage}% : {spent}/{limit}", { percentage: budgetGlobalPercentage.toFixed(0), spent: formatMoney(totalBudgetSpent), limit: formatMoney(totalBudgetLimit) }),
    );
  }

  // Standard budget alerts
  newState.budgets.forEach((budget) => {
    const spent = budget.current;

    if (spent > budget.limit) {
      alerts.push(
        message("Dépassement du budget {category} ({spent}/{limit})", { category: budget.category, spent: formatMoney(spent), limit: formatMoney(budget.limit) }),
      );
    } else if (spent >= budget.limit * 0.75) {
      alerts.push(message("Attention : 75% du budget {category} utilisé", { category: budget.category }));
    }
  });

  // Custom project alerts
  newState.customCategories.forEach((category) => {
    if (category.spent > category.budget) {
      alerts.push(
        message("Dépassement du projet {category} ({spent}/{limit})", { category: category.name, spent: formatMoney(category.spent), limit: formatMoney(category.budget) }),
      );
    } else if (category.spent >= category.budget * 0.9) {
      alerts.push(message("Attention : 90% du budget {category} utilisé", { category: category.name }));
    }
  });

  return alerts;
};
