"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import {
  AppState,
  BudgetContextType,
  Budget,
  SavingsGoal,
  Transaction,
  CustomCategory,
} from "@/types/budget";
import { autoCategorize } from "@/utils/categorization";

const BudgetContext = createContext<BudgetContextType | null>(null);

const INITIAL_DEMO_DATA: AppState = {
  transactions: [
    {
      id: "1",
      amount: 1200,
      date: new Date("2024-03-01"),
      description: "Loyer mars",
      category: "loyer",
      type: "expense",
    },
    {
      id: "2",
      amount: 2500,
      date: new Date("2024-03-05"),
      description: "Salaire",
      category: "salaire",
      type: "income",
    },
  ],
  budgets: [
    {
      id: "1",
      category: "nourriture",
      limit: 500,
      current: 450,
    },
    {
      id: "2",
      category: "transport",
      limit: 200,
      current: 0,
    },
  ],
  savingsGoals: [
    {
      id: "1",
      name: "Vacances d'été",
      target: 3000,
      current: 1200,
      deadline: new Date("2024-06-01"),
    },
  ],
  alerts: [],
  customCategories: [],
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(INITIAL_DEMO_DATA);

  const generateAlerts = (newState: AppState) => {
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

  const removeTransaction = (transactionId: string) => {
    setState((prev) => {
      const transactionToRemove = prev.transactions.find(
        (t) => t.id === transactionId
      );

      const updatedBudgets = prev.budgets.map((budget) => {
        if (
          transactionToRemove?.category === budget.category &&
          transactionToRemove?.type === "expense"
        ) {
          return {
            ...budget,
            current: Math.max(budget.current - transactionToRemove.amount, 0),
          };
        }
        return budget;
      });

      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== transactionId),
        budgets: updatedBudgets,
        alerts: generateAlerts({ ...prev, budgets: updatedBudgets }),
      };
    });
  };

  const addTransaction = (transaction: Transaction) => {
    setState((prev) => {
      const category =
        transaction.category || autoCategorize(transaction.description);
      const newTransaction = { ...transaction, category };

      const updatedBudgets = prev.budgets.map((budget) => {
        if (budget.category === category && transaction.type === "expense") {
          return {
            ...budget,
            current: budget.current + transaction.amount,
          };
        }
        return budget;
      });

      const newState = {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        budgets: updatedBudgets,
        alerts: generateAlerts({
          ...prev,
          transactions: [newTransaction, ...prev.transactions],
          budgets: updatedBudgets,
        }),
      };

      return newState;
    });
  };

  const addBudget = (budget: Budget) => {
    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets, budget],
      alerts: generateAlerts({ ...prev, budgets: [...prev.budgets, budget] }),
    }));
  };

  const removeBudget = (budgetId: string) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== budgetId),
    }));
  };

  const updateBudget = (updatedBudget: Budget) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === updatedBudget.id ? updatedBudget : b
      ),
    }));
  };

  const addSavingsGoal = (goal: SavingsGoal) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, goal],
    }));
  };

  const addCustomCategory = (name: string, budget: number) => {
    const newCategory: CustomCategory = {
      id: Math.random().toString(),
      name,
      budget,
      spent: 0,
      transactions: [],
      createdAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, newCategory],
      alerts: generateAlerts({
        ...prev,
        customCategories: [...prev.customCategories, newCategory],
      }),
    }));
  };

  const addCustomTransaction = (
    categoryId: string,
    transaction: Omit<Transaction, "id">
  ) => {
    setState((prev) => {
      const newState = {
        ...prev,
        customCategories: prev.customCategories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              spent: cat.spent + transaction.amount,
              transactions: [
                ...cat.transactions,
                { ...transaction, id: Math.random().toString() },
              ],
            };
          }
          return cat;
        }),
      };

      return {
        ...newState,
        alerts: generateAlerts(newState),
      };
    });
  };

  const resetDemoData = () => {
    setState(INITIAL_DEMO_DATA);
  };

  const getCategorySpending = (category: string) => {
    return state.transactions
      .filter((t) => t.category === category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const { totalIncome, totalExpenses, balance } = useMemo(
    () => ({
      totalIncome: state.transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: state.transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
      balance:
        state.transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0) -
        state.transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
    }),
    [state.transactions]
  );

  return (
    <BudgetContext.Provider
      value={{
        state,
        addTransaction,
        removeTransaction,
        addBudget,
        removeBudget,
        updateBudget,
        addSavingsGoal,
        getCategorySpending,
        resetDemoData,
        totalIncome,
        totalExpenses,
        balance,
        customCategories: state.customCategories,
        addCustomCategory,
        addCustomTransaction,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error("useBudget must be used within BudgetProvider");
  return context;
};
