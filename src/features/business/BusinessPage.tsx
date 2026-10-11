"use client";
import BusinessPeriodFilters, {
  localToday,
} from "./components/BusinessPeriodFilters";
import BusinessInsights from "./components/BusinessInsights";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import BusinessStats from "@/features/business/components/BusinessStats";
import BusinessChart from "@/features/business/components/BusinessChart";
import BusinessTransactions from "@/features/business/components/BusinessTransactions";
import AddBusinessTransactionModal from "@/features/business/components/AddBusinessTransactionModal";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import PageHeader from "@/components/ui/PageHeader";
import Navigation from "@/components/Navigation";

import type { BusinessTransaction, TimeRange } from "@/features/business/types";
import { useBusiness } from "./hooks/useBusiness";

export default function BusinessPage() {
  const { t } = useLocale();
  const [anchor, setAnchor] = useState(localToday);
  const [editing, setEditing] = useState<BusinessTransaction | undefined>();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const {
    transactions,
    analytics,
    loading,
    error,
    pending,
    reload,
    addTransaction,
    removeTransaction,
    updateTransaction,
  } = useBusiness(timeRange, anchor);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <PageHeader
          title="Business"
          description={t(
            "Suivez votre activité et les tendances de vos revenus.",
          )}
          action={
            <button
              disabled={pending || loading}
              onClick={() => {
                setEditing(undefined);
                setIsModalOpen(true);
              }}
              className="ui-primary flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              {t("Ajouter Transaction")}
            </button>
          }
        />

        <BusinessPeriodFilters
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          anchor={anchor}
          onAnchorChange={setAnchor}
          analytics={loading || error ? null : analytics}
        />
        {error && (
          <p role="alert" className="mb-4 text-red-600 dark:text-red-300">
            {t(error)}{" "}
            <button onClick={reload} className="underline">
              {t("Réessayer")}
            </button>
          </p>
        )}
        {loading && (
          <p role="status" className="mb-4 text-gray-500 dark:text-slate-300">
            {t("Chargement des données…")}
          </p>
        )}
        <BusinessStats analytics={loading || error ? null : analytics} loading={loading} />
        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]" aria-busy={loading}>
          <section className="ui-card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="ui-title">{t("Tendances financières")}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("Évolution des revenus et dépenses")}</p></div>
              <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-300">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-500" />{t("Revenus")}</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" />{t("Dépenses")}</span>
              </div>
            </div>
            {loading ? <div role="status" aria-label={t("Chargement du graphique")} className="h-80 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              : error ? <p className="py-8 text-sm text-slate-500 dark:text-slate-300">{t("Le graphique sera disponible après le chargement des données.")}</p>
              : <BusinessChart data={analytics?.chart ?? []} />}
          </section>
          {!loading && !error && analytics ? <BusinessInsights analytics={analytics} /> : <div className="ui-card min-h-80" aria-busy={loading}>{loading && <div className="h-full min-h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}</div>}
        </div>

        <div className="mt-6">
          {!loading && !error && analytics && (
            <BusinessTransactions
              pending={pending}
              onEdit={(transaction) => {
                setEditing(transaction);
                setIsModalOpen(true);
              }}
              onDelete={removeTransaction}
              transactions={transactions.filter(
                (t) =>
                  Date.parse(t.date) >= Date.parse(analytics.from) &&
                  Date.parse(t.date) < Date.parse(analytics.toExclusive),
              )}
            />
          )}
        </div>

        {isModalOpen && (
          <AddBusinessTransactionModal
            key={editing?.id ?? "create"}
            transaction={editing}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={(transaction) =>
              editing
                ? updateTransaction(editing.id, transaction)
                : addTransaction(transaction)
            }
          />
        )}
      </main>
    </div>
  );
}
