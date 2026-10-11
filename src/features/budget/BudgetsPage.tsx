"use client";
import FundingHistory from "./components/FundingHistory";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Pencil, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import PageHeader from "@/components/ui/PageHeader";
import SyncStatus from "@/components/ui/SyncStatus";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useBudget } from "./context/BudgetProvider";
import CategoryManager from "./components/CategoryManager";
import BudgetsView from "./components/BudgetsView";
export default function BudgetsPage() {
  const { loading, pending, error, reload } = useBudget();
  const { t } = useLocale();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const closeCategories = () => {
    if (!pending) setCategoriesOpen(false);
  };
  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <PageHeader
          title={t("Budgets")}
          description={t("Suivez vos limites de dépenses par catégorie.")}
          action={
            <button
              type="button"
              className="ui-primary"
              disabled={loading || pending}
              onClick={reload}
            >
              {t("Actualiser")}
            </button>
          }
        />
        <SyncStatus loading={loading} pending={pending} error={error} />
        {!loading && !error && (
          <>
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                className="ui-secondary inline-flex items-center gap-2"
                onClick={() => setCategoriesOpen(true)}
              >
                <Pencil size={18} aria-hidden="true" />
                {t("Modifier les catégories")}
              </button>
            </div>
            <BudgetsView />
            <FundingHistory />
          </>
        )}
      </main>
      <Dialog
        open={categoriesOpen}
        onClose={closeCategories}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="ui-dialog flex max-h-[85dvh] w-full max-w-2xl flex-col bg-white p-5 sm:p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="ui-title">
                {t("Modifier les catégories")}
              </Dialog.Title>
              <button
                type="button"
                className="ui-icon-button"
                aria-label={t("Fermer le formulaire")}
                disabled={pending}
                onClick={closeCategories}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto">
              <CategoryManager />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
