"use client";
import DateInput from "@/components/ui/DateInput";
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
  const [anchor, setAnchor] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
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

        <div className="ui-card mb-6 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            {t("Période des statistiques")}
            <select
              className="ui-input mt-1"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <option value="month">{t("Mensuel")}</option>
              <option value="quarter">{t("Trimestriel")}</option>
              <option value="year">{t("Annuel")}</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            {t("Date dans la période")}
            <DateInput
              value={anchor}
              onChange={(e) => {
                if (e.target.value) setAnchor(e.target.value);
              }}
              className="ui-input mt-1"
            />
          </label>
          <button
            className="ui-secondary"
            onClick={() => setAnchor(new Date().toISOString().slice(0, 10))}
          >
            {t("Aujourd’hui")}
          </button>
          {analytics && !loading && (
            <p className="ui-muted pb-2 text-sm">
              {analytics.from.slice(0, 10)} →{" "}
              {new Date(Date.parse(analytics.toExclusive) - 86400000)
                .toISOString()
                .slice(0, 10)}
            </p>
          )}
        </div>
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
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          aria-busy={loading}
        >
          <BusinessStats analytics={loading || error ? null : analytics} />

          <div className="lg:col-span-2">
            <div className="ui-card">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">
                  {t("Tendances financières")}
                </h2>
              </div>
              {loading ? (
                <div
                  role="status"
                  aria-label={t("Chargement du graphique")}
                  className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ) : error ? (
                <p className="py-8 text-sm text-slate-500 dark:text-slate-300">
                  {t(
                    "Le graphique sera disponible après le chargement des données.",
                  )}
                </p>
              ) : (
                <BusinessChart
                  data={loading || error ? [] : (analytics?.chart ?? [])}
                />
              )}
            </div>
          </div>
        </div>

        {!loading && !error && analytics && (
          <BusinessInsights analytics={analytics} />
        )}
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
