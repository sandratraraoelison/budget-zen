"use client";

import { AlertTriangle } from "lucide-react";
import { useBudget } from "@/context/BudgetProvider";

export default function AlertsCard() {
  const { state } = useBudget();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="text-danger w-5 h-5" />
        Alertes
      </h2>

      {state.alerts.length === 0 ? (
        <p className="text-gray-500">Aucune alerte pour le moment</p>
      ) : (
        <ul className="space-y-2">
          {state.alerts.map((alert, index) => (
            <li key={index} className="text-danger text-sm">
              • {alert}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
