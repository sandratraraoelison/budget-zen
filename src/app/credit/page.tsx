"use client";

import { useState } from "react";
import CreditList from "@/components/CreditList";
import AddCreditModal from "@/components/AddCreditModal";
import { Credit } from "@/types/credit";
import Navigation from "@/components/Navigation";
import SearchFilter from "@/components/SearchFilter";

export default function CreditPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [filteredCredits, setFilteredCredits] = useState<Credit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addCredit = (
    newCredit: Omit<Credit, "id" | "payments" | "remainingAmount">
  ) => {
    setCredits((prev) => [
      ...prev,
      {
        ...newCredit,
        id: Math.random().toString(),
        remainingAmount: newCredit.initialAmount,
        payments: [],
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Crédits</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
          >
            + Nouveau Crédit
          </button>
        </div>

        <SearchFilter credits={credits} onFilter={setFilteredCredits} />

        <CreditList credits={filteredCredits} setCredits={setCredits} />

        <AddCreditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addCredit}
        />
      </div>
    </div>
  );
}
