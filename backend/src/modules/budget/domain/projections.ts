import { fundingView } from "../../../shared/domain/funding";
import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { BudgetState, Transaction } from "./models";

export const transactionView = ({
  amountMinor,
  ...transaction
}: Transaction) => ({ ...transaction, amount: fromMinor(amountMinor) });
export const categorySpending = (
  transactions: Transaction[],
  category: string,
  customCategoryName?: string,
) =>
  sumMinor(
    transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category &&
          (t.customCategoryName ?? "").toLowerCase() ===
            (customCategoryName ?? "").toLowerCase(),
      )
      .map((t) => t.amountMinor),
  );

export function budgetSummary(state: BudgetState) {
  const budgets = state.budgets.map(({ limitMinor, ...budget }) => ({
    ...budget,
    limit: fromMinor(limitMinor),
    current: fromMinor(
      categorySpending(
        state.transactions,
        budget.category,
        budget.customCategoryName,
      ),
    ),
  }));
  const customCategories = state.customCategories
    .filter((c) => !c.hidden)
    .map(({ budgetMinor, transactions: legacyTransactions, ...category }) => {
      const transactions = [
        ...legacyTransactions,
        ...state.transactions.filter((t) => t.customCategoryId === category.id),
      ];
      return {
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
      };
    });
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
    state.budgets.map((b) =>
      categorySpending(state.transactions, b.category, b.customCategoryName),
    ),
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
        `Dépassement du budget ${budget.customCategoryName ?? budget.category} (${budget.current}/${budget.limit})`,
      );
    else if (budget.current >= budget.limit * 0.75)
      alerts.push(
        `Attention : 75% du budget ${budget.customCategoryName ?? budget.category} utilisé`,
      );
  }
  for (const category of customCategories) {
    if (category.budget <= 0) continue;
    if (category.spent > category.budget)
      alerts.push(
        `Dépassement du projet ${category.name} (${category.spent}/${category.budget})`,
      );
    else if (category.spent >= category.budget * 0.9)
      alerts.push(`Attention : 90% du budget ${category.name} utilisé`);
  }
  const savingsReservedMinor = sumMinor(state.savingsGoals.map((g) => g.currentMinor));
  return {
    savingsReserved: fromMinor(savingsReservedMinor),
    fundingHistory: (state.fundingHistory ?? []).map(fundingView),
    categoryOrder: state.categoryOrder ?? [],
    hiddenCategories: state.customCategories.flatMap((c) =>
      c.baseCategory ? [c.baseCategory] : [],
    ),
    transactions: state.transactions.map(transactionView),
    budgets,
    customCategories,
    alerts,
    savingsGoals: state.savingsGoals.map(
      ({ targetMinor, currentMinor, ...goal }) => ({
        ...goal,
        history: (state.fundingHistory ?? []).filter((e) => e.goalId === goal.id).map(fundingView),
        target: fromMinor(targetMinor),
        current: fromMinor(currentMinor),
      }),
    ),
    totalIncome: fromMinor(totalIncomeMinor),
    totalExpenses: fromMinor(totalExpensesMinor),
    balance: fromMinor(totalIncomeMinor - totalExpensesMinor - savingsReservedMinor),
  };
}
