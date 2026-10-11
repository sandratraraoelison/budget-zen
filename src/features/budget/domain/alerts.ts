import type { AppState } from "../types";

export const generateAlerts = (newState: AppState) => {
  const alerts: string[] = [];

  // Calculation of the overall budget
  const totalBudgetLimit = newState.budgets.reduce(
    (sum, b) => sum + b.limit,
    0
  );
  const totalBudgetSpent = newState.budgets.reduce(
    (sum, b) => sum + b.current,
    0
  );
  const budgetGlobalPercentage =
    totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // Global budget alerts
  if (totalBudgetSpent > totalBudgetLimit) {
    alerts.push(
      `🚨 Budget global dépassé : ${totalBudgetSpent.toFixed(
        2
      )}MGA/${totalBudgetLimit.toFixed(2)}MGA`
    );
  } else if (budgetGlobalPercentage >= 90) {
    alerts.push(
      `⚠️ Budget global à ${budgetGlobalPercentage.toFixed(
        0
      )}% : ${totalBudgetSpent.toFixed(2)}MGA/${totalBudgetLimit.toFixed(
        2
      )}MGA`
    );
  }

  // Standard budget alerts
  newState.budgets.forEach((budget) => {
    const spent = newState.transactions
      .filter((t) => t.category === budget.category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    if (spent > budget.limit) {
      alerts.push(
        `Dépassement du budget ${budget.category} (${spent}MGA/${budget.limit}MGA)`
      );
    } else if (spent >= budget.limit * 0.75) {
      alerts.push(`Attention : 75% du budget ${budget.category} utilisé`);
    }
  });

  // Custom project alerts
  newState.customCategories.forEach((category) => {
    if (category.spent > category.budget) {
      alerts.push(
        `Dépassement du projet ${category.name} (${category.spent}MGA/${category.budget}MGA)`
      );
    } else if (category.spent >= category.budget * 0.9) {
      alerts.push(`Attention : 90% du budget ${category.name} utilisé`);
    }
  });

  return alerts;
};

