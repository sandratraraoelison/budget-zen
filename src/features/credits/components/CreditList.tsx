"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { Credit } from "@/features/credits/types";
import CreditItem from "./CreditItem";

interface CreditListProps {
  credits: Credit[];
  setCredits: React.Dispatch<React.SetStateAction<Credit[]>>;
}

export default function CreditList({ credits, setCredits }: CreditListProps) {
  const { t } = useLocale();
  const deleteCredit = (id: string) => {
    if (window.confirm(t("Êtes-vous sûr de vouloir supprimer ce crédit ?"))) {
      setCredits((prev) => prev.filter((credit) => credit.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {credits.map((credit) => (
        <CreditItem
          key={credit.id}
          credit={credit}
          onUpdate={(updated) =>
            setCredits((prev) =>
              prev.map((c) => (c.id === credit.id ? updated : c))
            )
          }
          onDelete={() => deleteCredit(credit.id)}
        />
      ))}
    </div>
  );
}
