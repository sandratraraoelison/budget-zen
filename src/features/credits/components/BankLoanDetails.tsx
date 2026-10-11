"use client";
import { useState } from "react";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";
import { useCurrency } from "@/features/settings/CurrencyProvider";
import { bankProjection } from "../domain/bank-loan";
import type { Credit } from "../types";
export default function BankLoanDetails({
  credit,
  update,
}: {
  credit: Credit;
  update(credit: Credit): Promise<void>;
}) {
  const { t } = useLocale();
  const { formatMoney } = useCurrency();
  const [draw, setDraw] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  if (!credit.bankLoan) return null;
  const bank = credit.bankLoan;
  const projection = bankProjection(credit.initialAmount, bank);
  async function drawFunds() {
    if (pending) return;
    setError("");
    const amount = Number(draw);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount !== Number(amount.toFixed(2)) ||
      amount > bank.creditLimit! - credit.remainingAmount
    ) {
      setError(t("Le capital utilisé dépasse le plafond."));
      return;
    }
    setPending(true);
    try {
      await update({
        ...credit,
        initialAmount:
          (Math.round(credit.initialAmount * 100) + Math.round(amount * 100)) /
          100,
      });
      setDraw("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/50">
      <div className="flex justify-between gap-2">
        <span>
          {t("Crédit bancaire")} ·{" "}
          {t(
            bank.rateType === "fixed"
              ? "Fixe"
              : bank.rateType === "variable"
                ? "Variable"
                : "Renouvelable",
          )}
        </span>
        <strong>{bank.annualRate} %</strong>
      </div>
      <div className="flex justify-between">
        <span>{t("Mensualité estimée")}</span>
        <strong>{formatMoney(projection.monthlyPayment)}</strong>
      </div>
      <div className="flex justify-between">
        <span>{t("Coût estimé")}</span>
        <span>{formatMoney(projection.totalCost)}</span>
      </div>
      <p>
        {bank.termMonths} {t("mois")} · {t("Première échéance")} :{" "}
        {bank.firstPaymentDate}
      </p>
      {bank.reference && <p>{bank.reference}</p>}
      <p className="text-slate-500 dark:text-slate-400">
        {t(
          "Échéancier prévisionnel ; renseignez les intérêts réels lors du paiement.",
        )}
      </p>
      {bank.rateType !== "fixed" && (
        <p>{t("Projection au taux actuel, à actualiser si le taux change.")}</p>
      )}
      {bank.rateType === "revolving" && (
        <div className="space-y-2 border-t pt-2 dark:border-slate-700">
          <p>
            {t("Disponible au plafond")} :{" "}
            {formatMoney(bank.creditLimit! - credit.remainingAmount)}
          </p>
          <label>
            {t("Nouveau tirage")}
            <AmountInput
              value={draw}
              onChange={(e) => setDraw(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <button
            disabled={pending}
            onClick={() => void drawFunds()}
            className="ui-primary w-full"
          >
            {t("Débloquer le capital")}
          </button>
          {error && (
            <p role="alert" className="text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
      <details>
        <summary className="cursor-pointer font-medium">
          {t("Échéancier prévisionnel")}
        </summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Capital")}</th>
                <th>{t("Intérêts")}</th>
                <th>{t("Total payé")}</th>
              </tr>
            </thead>
            <tbody>
              {projection.schedule.map((row) => (
                <tr key={row.number} className="border-t dark:border-slate-800">
                  <td className="py-2">{row.date}</td>
                  <td>{formatMoney(row.capital)}</td>
                  <td>{formatMoney(row.interest)}</td>
                  <td>{formatMoney(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
