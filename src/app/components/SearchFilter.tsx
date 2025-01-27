"use client";

import { Credit, CreditStatus } from "@/types/credit";
import { useState, useEffect } from "react";

export default function SearchFilter({
  credits,
  onFilter,
}: {
  credits: Credit[];
  onFilter: (filtered: Credit[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreditStatus | "all">("all");

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, credits]);

  const applyFilters = () => {
    let filtered = [...credits];

    // Filtre par recherche
    filtered = filtered.filter((credit) =>
      credit.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((credit) => {
        const today = new Date();
        const endDate = credit.endDate ? new Date(credit.endDate) : null;

        if (statusFilter === "paid") return credit.remainingAmount === 0;
        if (statusFilter === "unpaid") return credit.remainingAmount > 0;
        if (statusFilter === "expired") return endDate && endDate < today;
        if (statusFilter === "warning") {
          if (!endDate) return false;
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        }
        return true;
      });
    }

    onFilter(filtered);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Rechercher par contact..."
          className="p-2 border rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded-lg bg-white"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as CreditStatus | "all")
          }
        >
          <option value="all">Tous les statuts</option>
          <option value="paid">Payé</option>
          <option value="unpaid">Non payé</option>
          <option value="warning">Échéance proche</option>
          <option value="expired">Échéance dépassée</option>
        </select>
      </div>
    </div>
  );
}
