"use client";
import AmountInput from "@/components/ui/AmountInput";
import DateInput from "@/components/ui/DateInput";
import { useLocale } from "@/features/settings/LocaleProvider";
import type { BankLoan } from "../domain/bank-loan";
export function newBankLoan(date: string): BankLoan {
  return {
    rateType: "fixed",
    annualRate: 0,
    termMonths: 12,
    firstPaymentDate: date,
    insuranceMonthly: 0,
    fees: 0,
  };
}
export default function BankLoanFields({
  value,
  change,
  startDate,
}: {
  value: BankLoan;
  change(value: BankLoan): void;
  startDate: string;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <legend className="px-1 font-medium">{t("Conditions bancaires")}</legend>
      <label className="block">
        {t("Type de taux")}
        <select
          className="w-full rounded border p-2"
          value={value.rateType}
          onChange={(event) =>
            change({
              ...value,
              rateType: event.target.value as BankLoan["rateType"],
            })
          }
        >
          <option value="fixed">{t("Fixe")}</option>
          <option value="variable">{t("Variable")}</option>
          <option value="revolving">{t("Renouvelable")}</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label>
          {t("Taux annuel (%)")}
          <input
            className="w-full rounded border p-2"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={value.annualRate}
            onChange={(e) =>
              change({ ...value, annualRate: Number(e.target.value) })
            }
          />
        </label>
        <label>
          {t("Durée (mois)")}
          <input
            className="w-full rounded border p-2"
            type="number"
            min="1"
            max="600"
            value={value.termMonths}
            onChange={(e) =>
              change({ ...value, termMonths: Number(e.target.value) })
            }
          />
        </label>
        <label>
          {t("Assurance mensuelle")}
          <AmountInput
            className="w-full rounded border p-2"
            value={value.insuranceMonthly}
            onChange={(e) =>
              change({ ...value, insuranceMonthly: Number(e.target.value) })
            }
          />
        </label>
        <label>
          {t("Frais de dossier")}
          <AmountInput
            className="w-full rounded border p-2"
            value={value.fees}
            onChange={(e) => change({ ...value, fees: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="block">
        {t("Première échéance")}
        <DateInput
          className="w-full rounded border p-2"
          min={startDate}
          value={value.firstPaymentDate}
          onChange={(e) =>
            change({ ...value, firstPaymentDate: e.target.value })
          }
        />
      </label>
      {value.rateType === "revolving" && (
        <label className="block">
          {t("Plafond autorisé")}
          <AmountInput
            className="w-full rounded border p-2"
            value={value.creditLimit ?? ""}
            onChange={(e) =>
              change({ ...value, creditLimit: Number(e.target.value) })
            }
          />
        </label>
      )}
      <label className="block">
        {t("Référence du contrat (optionnel)")}
        <input
          className="w-full rounded border p-2"
          maxLength={100}
          value={value.reference ?? ""}
          onChange={(e) => change({ ...value, reference: e.target.value })}
        />
      </label>
      {value.rateType !== "fixed" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("Projection au taux actuel, à actualiser si le taux change.")}
        </p>
      )}
    </fieldset>
  );
}
