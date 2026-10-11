"use client";

import { useState } from "react";
import BusinessStats from "@/features/business/components/BusinessStats";
import BusinessChart from "@/features/business/components/BusinessChart";
import BusinessTransactions from "@/features/business/components/BusinessTransactions";
import AddBusinessTransactionModal from "@/features/business/components/AddBusinessTransactionModal";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import PageHeader from "@/components/ui/PageHeader";
import Navigation from "@/components/Navigation";

import type { TimeRange } from "@/features/business/types";
import { useBusiness } from "./hooks/useBusiness";

export default function BusinessPage() {
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
  } = useBusiness(timeRange);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <PageHeader
          title="Business"
          description="Suivez votre activité et les tendances de vos revenus."
          action={
            <button
              disabled={pending || loading}
              onClick={() => setIsModalOpen(true)}
              className="ui-primary flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Ajouter Transaction
            </button>
          }
        />

        {error && (
          <p role="alert" className="mb-4 text-red-600">
            {error}{" "}
            <button onClick={reload} className="underline">
              Réessayer
            </button>
          </p>
        )}
        {loading && (
          <p role="status" className="mb-4 text-gray-500">
            Chargement des données…
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
                <h2 className="text-xl font-semibold">Tendances financières</h2>
                <select
                  aria-label="Période des statistiques"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="p-2 border rounded-lg"
                >
                  <option value="month">Mensuel</option>
                  <option value="quarter">Trimestriel</option>
                  <option value="year">Annuel</option>
                </select>
              </div>
              {loading ? (
                <div
                  role="status"
                  aria-label="Chargement du graphique"
                  className="h-64 animate-pulse rounded-xl bg-slate-100"
                />
              ) : error ? (
                <p className="py-8 text-sm text-slate-500">
                  Le graphique sera disponible après le chargement des données.
                </p>
              ) : (
                <BusinessChart
                  data={loading || error ? [] : (analytics?.chart ?? [])}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {!loading && !error && analytics && (
            <BusinessTransactions
              pending={pending}
              onDelete={removeTransaction}
              transactions={transactions.filter(
                (t) =>
                  Date.parse(t.date) >= Date.parse(analytics.from) &&
                  Date.parse(t.date) < Date.parse(analytics.toExclusive),
              )}
            />
          )}
        </div>

        <AddBusinessTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addTransaction}
        />
      </main>
    </div>
  );
}
