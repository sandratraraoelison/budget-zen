import type { Transaction } from "../types";

export function getCategorySpending(transactions: Transaction[], category: string) {
  return transactions.reduce((sum, transaction) =>
    transaction.type === "expense" && transaction.category === category
      ? sum + transaction.amount : sum, 0);
}

export function getTransactionTotals(transactions: Transaction[]) {
  const totals = transactions.reduce((result, transaction) => {
    if (transaction.type === "income") result.totalIncome += transaction.amount;
    else result.totalExpenses += transaction.amount;
    return result;
  }, { totalIncome: 0, totalExpenses: 0 });
  return { ...totals, balance: totals.totalIncome - totals.totalExpenses };
}
