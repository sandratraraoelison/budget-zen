"use client";

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

export default function CreditPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreditStatus | "all">("all");
  const filteredCredits = filterCredits(credits, searchTerm, statusFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addCredit = (
    newCredit: Omit<Credit, "id" | "payments" | "remainingAmount">,
  ) => {
    const credit = reconcileCredit({
      ...newCredit,
      id: crypto.randomUUID(),
      remainingAmount: newCredit.initialAmount,
      payments: [],
    });
    setCredits((prev) => [...prev, credit]);
  };

  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        <PageHeader
          title="Crédits"
          description="Gardez une vue claire sur vos prêts, emprunts et remboursements."
          action={
            <button onClick={() => setIsModalOpen(true)} className="ui-primary">
              + Nouveau Crédit
            </button>
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
                ? "Aucun crédit trouvé"
                : "Votre suivi des crédits commence ici"
            }
            description={
              credits.length
                ? "Modifiez les filtres pour retrouver vos crédits."
                : "Ajoutez un prêt ou un emprunt pour suivre son remboursement."
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
                  ? "Réinitialiser les filtres"
                  : "Ajouter un crédit"}
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
