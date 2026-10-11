"use client";
import FundingHistory from "./components/FundingHistory";
import SyncStatus from "@/components/ui/SyncStatus";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useBudget } from "./context/BudgetProvider";
import { useState } from "react";
import TransactionModal from "./components/TransactionModal";
import SpendingChart from "./components/SpendingChart";
import BudgetCard from "./components/BudgetCard";
import Link from "next/link";
import AlertsCard from "./components/AlertsCard";
import SavingsSection from "./components/SavingsSection";
import Navigation from "@/components/Navigation";
import PageHeader from "@/components/ui/PageHeader";
import { TransactionsList } from "./components/TransactionsList";
import BalanceCard from "./components/BalanceCard";
import WorkspaceOverview from "./components/WorkspaceOverview";

export default function Dashboard() {
  const { t } = useLocale();
  const { error, loading, pending } = useBudget();
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <SyncStatus loading={loading} pending={pending} error={error} />
        <PageHeader
          title={t("Tableau de bord")}
          description={t(
            "Une vue claire de vos finances, pour savoir où vous en êtes et préparer la suite.",
          )}
          action={
            <button
              disabled={loading || pending}
              type="button"
              onClick={() => {
                setNotice("");
                setTransactionModalOpen(true);
              }}
              className="ui-primary"
            >
              {t("+ Ajouter une transaction")}
            </button>
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
              <Link
                href="/budgets"
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 dark:text-teal-300"
              >
                {t("Gérer les budgets")}
              </Link>
            </section>
            <SavingsSection />
            <FundingHistory />
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
