"use client";

import { AlertTriangle, CircleCheck } from "lucide-react";
import { useBudget } from "@/features/budget/context/BudgetProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { generateAlerts } from "../domain/alerts";

export default function AlertsCard() {
  const { state } = useBudget();
  const { formatMoney } = useCurrency();
  const alerts = generateAlerts(state, formatMoney);

  return (
    <section className="ui-card">
      <h2 className="ui-title mb-4 flex items-center gap-2">
        {alerts.length ? (
          <AlertTriangle
            className="text-amber-600 w-5 h-5"
            aria-hidden="true"
          />
        ) : (
          <CircleCheck className="text-teal-700 w-5 h-5" aria-hidden="true" />
        )}
        Points de vigilance
      </h2>

      {alerts.length === 0 ? (
        <div className="rounded-xl bg-teal-50 p-4">
          <p className="text-sm font-medium text-teal-900">
            Tout est sous contrôle
          </p>
          <p className="mt-1 text-sm leading-6 text-teal-800">
            Aucun dépassement de budget à signaler.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, index) => (
            <li
              key={index}
              className="rounded-lg bg-amber-50 p-3 text-amber-900 text-sm leading-6"
            >
              {alert}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
