"use client";

import { Credit } from "@/types/credit";
import CreditItem from "./CreditItem";

interface CreditListProps {
  credits: Credit[];
  setCredits: React.Dispatch<React.SetStateAction<Credit[]>>;
}

export default function CreditList({ credits, setCredits }: CreditListProps) {
  const deleteCredit = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce crédit ?")) {
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
