import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { BudgetState, Transaction } from "./models";

export const transactionView = ({
  amountMinor,
  ...transaction
}: Transaction) => ({ ...transaction, amount: fromMinor(amountMinor) });
export const categorySpending = (
  transactions: Transaction[],
  category: string,
) =>
  sumMinor(
    transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .map((t) => t.amountMinor),
  );

export function budgetSummary(state: BudgetState) {
  const budgets = state.budgets.map(({ limitMinor, ...budget }) => ({
    ...budget,
    limit: fromMinor(limitMinor),
    current: fromMinor(categorySpending(state.transactions, budget.category)),
  }));
  const customCategories = state.customCategories.map(
    ({ budgetMinor, transactions, ...category }) => ({
      ...category,
      budget: fromMinor(budgetMinor),
      spent: fromMinor(
        sumMinor(
          transactions
            .filter((t) => t.type === "expense")
            .map((t) => t.amountMinor),
        ),
      ),
      transactions: transactions.map(transactionView),
    }),
  );
  const totalIncomeMinor = sumMinor(
    state.transactions
      .filter((t) => t.type === "income")
      .map((t) => t.amountMinor),
  );
  const totalExpensesMinor = sumMinor(
    state.transactions
      .filter((t) => t.type === "expense")
      .map((t) => t.amountMinor),
  );
  const limit = sumMinor(state.budgets.map((b) => b.limitMinor));
  const spent = sumMinor(
    state.budgets.map((b) => categorySpending(state.transactions, b.category)),
  );
  const alerts: string[] = [];
  if (spent > limit)
    alerts.push(
      `Budget global dépassé : ${fromMinor(spent)}/${fromMinor(limit)}`,
    );
  else if (limit > 0 && spent / limit >= 0.9)
    alerts.push(`Attention : 90% du budget global utilisé`);
  for (const budget of budgets) {
    if (budget.current > budget.limit)
      alerts.push(
        `Dépassement du budget ${budget.category} (${budget.current}/${budget.limit})`,
      );
    else if (budget.current >= budget.limit * 0.75)
      alerts.push(`Attention : 75% du budget ${budget.category} utilisé`);
  }
  for (const category of customCategories) {
    if (category.spent > category.budget)
      alerts.push(
        `Dépassement du projet ${category.name} (${category.spent}/${category.budget})`,
      );
    else if (category.spent >= category.budget * 0.9)
      alerts.push(`Attention : 90% du budget ${category.name} utilisé`);
  }
  return {
    transactions: state.transactions.map(transactionView),
    budgets,
    customCategories,
    alerts,
    savingsGoals: state.savingsGoals.map(
      ({ targetMinor, currentMinor, ...goal }) => ({
        ...goal,
        target: fromMinor(targetMinor),
        current: fromMinor(currentMinor),
      }),
    ),
    totalIncome: fromMinor(totalIncomeMinor),
    totalExpenses: fromMinor(totalExpensesMinor),
    balance: fromMinor(totalIncomeMinor - totalExpensesMinor),
  };
}
