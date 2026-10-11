"use client";

import { CreditStatus } from "@/features/credits/types";

export default function SearchFilter({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  searchTerm: string;
  statusFilter: CreditStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CreditStatus | "all") => void;
}) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          aria-label="Rechercher un crédit par contact"
          type="text"
          placeholder="Rechercher par contact..."
          className="p-2 border rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select
          aria-label="Filtrer les crédits par statut"
          className="p-2 border rounded-lg bg-white"
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as CreditStatus | "all")
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
