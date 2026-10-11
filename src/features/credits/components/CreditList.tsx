"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { Credit } from "@/features/credits/types";
import CreditItem from "./CreditItem";

interface CreditListProps {
  credits: Credit[];
  setCredits: (update: React.SetStateAction<Credit[]>) => Promise<void>;
}

export default function CreditList({ credits, setCredits }: CreditListProps) {
  const { t } = useLocale();
  const deleteCredit = (id: string) => {
    if (window.confirm(t("Êtes-vous sûr de vouloir supprimer ce crédit ?"))) {
      void setCredits((prev) =>
        prev.filter((credit) => credit.id !== id),
      ).catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      {(["borrowed", "lent", "bank"] as const).map((type) => {
        const items = credits.filter((credit) =>
          type === "bank"
            ? !!credit.bankLoan
            : credit.type === type && !credit.bankLoan,
        );
        if (!items.length) return null;
        return (
          <section key={type} className="space-y-4">
            <h2
              className={`flex items-center gap-2 text-lg font-semibold ${type !== "lent" ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${type !== "lent" ? "bg-red-500" : "bg-emerald-500"}`}
              />
              {t(
                type === "bank"
                  ? "Crédits bancaires"
                  : type === "borrowed"
                    ? "Emprunts"
                    : "Prêts",
              )}{" "}
              <span className="text-sm text-gray-500">({items.length})</span>
            </h2>
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((credit) => (
                <CreditItem
                  key={credit.id}
                  credit={credit}
                  onUpdate={(updated) =>
                    setCredits((prev) =>
                      prev.map((c) => (c.id === credit.id ? updated : c)),
                    )
                  }
                  onDelete={() => deleteCredit(credit.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
