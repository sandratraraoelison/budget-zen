"use client";

import { useBudget } from "@/context/BudgetProvider";
import TransactionForm from "@/components/TransactionForm";
import SpendingChart from "@/components/SpendingChart";
import BudgetCard from "@/components/BudgetCard";
import BudgetForm from "@/components/BudgetForm";
import AlertsCard from "@/components/AlertsCard";
import SavingsGoalCard from "@/components/SavingsGoalCard";
import Navigation from "@/components/Navigation";
import { TransactionsList } from "@/components/TransactionsList";
import ForecastCard from "@/components/ForecastCard";
import BalanceCard from "@/components/BalanceCard";

export default function Dashboard() {
  const { state } = useBudget();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-4">Nouvelle Transaction</h1>
              <TransactionForm />
              <TransactionsList />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <SpendingChart />
            </div>
          </div>

          <div className="space-y-6">
            <BalanceCard />
            <div className="bg-white p-6 rounded-lg shadow-md">
              <AlertsCard />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <BudgetForm />
              <h2 className="text-2xl font-bold mb-4">Budgets</h2>
              <BudgetCard />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Objectifs d'épargne</h2>
              {state.savingsGoals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun objectif d'épargne défini
                </p>
              ) : (
                state.savingsGoals.map((goal) => (
                  <SavingsGoalCard key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
