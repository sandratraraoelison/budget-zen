"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useBudget } from "./context/BudgetProvider";
import { useState } from "react";
import TransactionModal from "./components/TransactionModal";
import SpendingChart from "./components/SpendingChart";
import BudgetCard from "./components/BudgetCard";
import BudgetForm from "./components/BudgetForm";
import AlertsCard from "./components/AlertsCard";
import SavingsGoalCard from "./components/SavingsGoalCard";
import Navigation from "@/components/Navigation";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { TransactionsList } from "./components/TransactionsList";
import BalanceCard from "./components/BalanceCard";
import WorkspaceOverview from "./components/WorkspaceOverview";

export default function Dashboard() {
  const { t } = useLocale();
  const { state } = useBudget();
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <PageHeader
          title={t("Tableau de bord")}
          description={t("Une vue claire de vos finances, pour savoir où vous en êtes et préparer la suite.")}
          action={
            <button
              type="button"
              onClick={() => {
                setNotice("");
                setTransactionModalOpen(true);
              }}
              className="ui-primary"
            >{t("+ Ajouter une transaction")}</button>
          }
        />
        <BalanceCard />
        <WorkspaceOverview />
        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
          >
            {notice}
          </p>
        )}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <TransactionsList />
            <SpendingChart />
          </div>
          <aside
            className="min-w-0 space-y-6"
            aria-label={t("Suivi des budgets et objectifs")}
          >
            <AlertsCard />
            <section
              id="budget-summary"
              className="ui-card scroll-mt-6"
              aria-label={t("Vos budgets")}
            >
              <BudgetCard />
              <details
                className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700"
                open={state.budgets.length === 0}
              >
                <summary className="cursor-pointer rounded-lg py-2 text-sm font-semibold text-teal-800 dark:text-teal-300">{t("Ajouter un budget")}</summary>
                <div className="mt-3">
                  <BudgetForm />
                </div>
              </details>
            </section>
            <section className="ui-card" aria-labelledby="savings-heading">
              <h2 id="savings-heading" className="ui-title mb-4">{t("Objectifs d’épargne")}</h2>
              {state.savingsGoals.length === 0 ? (
                <EmptyState
                  title={t("Vos objectifs prennent forme ici")}
                  description={t("Aucun objectif d’épargne défini pour le moment.")}
                />
              ) : (
                state.savingsGoals.map((goal) => (
                  <SavingsGoalCard key={goal.id} goal={goal} />
                ))
              )}
            </section>
          </aside>
        </div>
      </main>
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onSuccess={() => {
          setTransactionModalOpen(false);
          setNotice(t("Transaction ajoutée à votre historique."));
        }}
      />
    </div>
  );
}
