"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  BudgetContextType,
  Budget,
  SavingsGoal,
  Transaction,
} from "../types";
import { createDemoState } from "../data/demo";
import { sumAmounts } from "@/shared/domain/money";
import { useCredits } from "@/features/credits/context/CreditsProvider";
import { budgetReducer, type BudgetAction } from "../domain/reducer";
import {
  getCategorySpending as selectCategorySpending,
  getTransactionTotals,
} from "../domain/selectors";

import { notify } from "@/shared/notifications/notifications";
import { loadBudget, saveAction } from "../infrastructure/budget-repository";
import { useAccountResource } from "@/shared/application/useAccountResource";

const BudgetContext = createContext<BudgetContextType | null>(null);

export const BudgetProvider = ({
  children,
  isDemo = false,
}: {
  children: ReactNode;
  isDemo?: boolean;
}) => {
  const [localState, setState] = useState(() =>
    isDemo
      ? createDemoState()
      : {
          transactions: [],
          budgets: [],
          savingsGoals: [],
          alerts: [],
          customCategories: [],
        },
  );
  const load = useCallback(loadBudget, []);
  const remote = useAccountResource(load, !isDemo);
  const creditResource = useCredits();
  const state = isDemo ? localState : (remote.data ?? localState);
  const currentState = useRef(state);
  currentState.current = state;
  const dispatch = (action: BudgetAction) => {
    // Validate synchronously so the form can display failures without crashing React.
    const next = budgetReducer(currentState.current, action);
    if (isDemo) {
      currentState.current = next;
      setState(next);
      notify("Modifications enregistrées.");
      return Promise.resolve();
    }
    return remote.mutate(async (previous) => {
      budgetReducer(previous, action);
      await saveAction(action);
    });
  };
  const {
    totalIncome,
    totalExpenses,
    balance: ledgerBalance,
  } = useMemo(
    () => getTransactionTotals(state.transactions),
    [state.transactions],
  );
  const creditBalance =
    creditResource.loading || creditResource.error
      ? (state.creditBalance ?? 0)
      : creditResource.credits.reduce(
          (total, credit) =>
            total +
            ((credit.type === "borrowed" ? 1 : -1) *
              (Math.round(credit.initialAmount * 100) -
                credit.payments.reduce(
                  (paid, payment) => paid + Math.round(payment.amount * 100),
                  0,
                ))) /
              100 -
            (credit.bankLoan?.fees ?? 0),
          0,
        );
  const balance =
    (Math.round(ledgerBalance * 100) + Math.round(creditBalance * 100)) / 100;
  const addTransaction = (transaction: Transaction) =>
    dispatch({ type: "transaction/add", transaction });
  const removeTransaction = (id: string) =>
    dispatch({ type: "transaction/remove", id });
  const addBudget = (budget: Budget) =>
    dispatch({ type: "budget/add", budget });
  const updateBudget = (budget: Budget) =>
    dispatch({ type: "budget/update", budget });
  const removeBudget = (id: string) => dispatch({ type: "budget/remove", id });
  const addSavingsGoal = (goal: SavingsGoal) =>
    dispatch({ type: "savings/add", goal });
  const resetDemoData = () => dispatch({ type: "reset" });
  const getCategorySpending = (category: string) =>
    selectCategorySpending(state.transactions, category);
  const addCustomCategory = (name: string, budget: number) =>
    dispatch({
      type: "category/add",
      category: {
        id: crypto.randomUUID(),
        name,
        budget,
        spent: 0,
        transactions: [],
        createdAt: new Date(),
      },
    });
  const addCustomTransaction = (
    categoryId: string,
    transaction: Omit<Transaction, "id">,
  ) =>
    dispatch({
      type: "category/transaction",
      categoryId,
      transaction: { ...transaction, id: crypto.randomUUID() },
    });

  return (
    <BudgetContext.Provider
      value={{
        reorderCategories: (ids) => dispatch({ type: "category/order", ids }),
        saveCategory: (category, create = false) =>
          dispatch({
            type: create ? "category/add" : "category/update",
            category,
          }),
        removeCategory: (id) => dispatch({ type: "category/remove", id }),
        state,
        error: remote.error,
        loading: remote.loading,
        pending: remote.pending,
        reload: remote.reload,
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
