"use client";
import SyncStatus from "@/components/ui/SyncStatus";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import CreditList from "@/features/credits/components/CreditList";
import AddCreditModal from "@/features/credits/components/AddCreditModal";
import { Credit, CreditStatus } from "@/features/credits/types";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Navigation from "@/components/Navigation";
import { filterCredits } from "./domain/filterCredits";
import SearchFilter from "@/features/credits/components/SearchFilter";
import { reconcileCredit } from "./domain/credit";
import { useCredits } from "./context/CreditsProvider";

export default function CreditPage() {
  const { t } = useLocale();
  const { credits, setCredits, error, loading, pending } = useCredits();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreditStatus | "all">("all");
  const filteredCredits = filterCredits(credits, searchTerm, statusFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addCredit = async (
    newCredit: Omit<Credit, "id" | "payments" | "remainingAmount">,
  ) => {
    const credit = reconcileCredit({
      ...newCredit,
      id: crypto.randomUUID(),
      remainingAmount: newCredit.initialAmount,
      payments: [],
    });
    await setCredits((prev) => [...prev, credit]);
  };

  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <SyncStatus loading={loading} pending={pending} error={error} />
        <PageHeader
          title={t("Crédits")}
          description={t("Gardez une vue claire sur vos prêts, emprunts et remboursements.")}
          action={
            <button disabled={loading || pending} onClick={() => setIsModalOpen(true)} className="ui-primary">{t("+ Nouveau Crédit")}</button>
          }
        />

        <SearchFilter
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        {filteredCredits.length === 0 && (
          <EmptyState
            title={
              credits.length
                ? t("Aucun crédit trouvé")
                : t("Votre suivi des crédits commence ici")
            }
            description={
              credits.length
                ? t("Modifiez les filtres pour retrouver vos crédits.")
                : t("Ajoutez un prêt ou un emprunt pour suivre son remboursement.")
            }
            action={
              <button
                onClick={() => {
                  if (!credits.length) {
                    setIsModalOpen(true);
                    return;
                  }
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="ui-primary"
              >
                {credits.length
                  ? t("Réinitialiser les filtres")
                  : t("Ajouter un crédit")}
              </button>
            }
          />
        )}

        <CreditList credits={filteredCredits} setCredits={setCredits} />

        <AddCreditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addCredit}
        />
      </main>
    </div>
  );
}
