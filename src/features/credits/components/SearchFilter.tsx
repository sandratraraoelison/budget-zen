"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

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
  const { t } = useLocale();
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          aria-label={t("Rechercher un crédit par contact")}
          type="text"
          placeholder={t("Rechercher par contact...")}
          className="p-2 border rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select
          aria-label={t("Filtrer les crédits par statut")}
          className="p-2 border rounded-lg bg-white dark:bg-slate-900"
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as CreditStatus | "all")
          }
        >
          <option value="all">{t("Tous les statuts")}</option>
          <option value="paid">{t("Payé")}</option>
          <option value="unpaid">{t("Non payé")}</option>
          <option value="warning">{t("Échéance proche")}</option>
          <option value="expired">{t("Échéance dépassée")}</option>
        </select>
      </div>
    </div>
  );
}
