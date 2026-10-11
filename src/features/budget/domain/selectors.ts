import type { Transaction } from "../types";
import { sumAmounts, subtractAmounts } from "../../../shared/domain/money";

export function getCategorySpending(
  transactions: Transaction[],
  category: string,
) {
  return sumAmounts(
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" && transaction.category === category,
      )
      .map((transaction) => transaction.amount),
  );
}

export function getTransactionTotals(transactions: Transaction[]) {
  const totalIncome = sumAmounts(
    transactions.filter((t) => t.type === "income").map((t) => t.amount),
  );
  const totalExpenses = sumAmounts(
    transactions.filter((t) => t.type === "expense").map((t) => t.amount),
  );
  return {
    totalIncome,
    totalExpenses,
    balance: subtractAmounts(totalIncome, totalExpenses),
  };
}
