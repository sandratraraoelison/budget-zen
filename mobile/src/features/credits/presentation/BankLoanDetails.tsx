import { useState } from "react";
import { Button, Label } from "../../../shared/ui/components";
import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import { useCurrency } from "../../settings/CurrencyProvider";
import { parseAmount } from "../../budget/domain/budget";
import { bankProjection } from "../domain/bank-loan";
import type { Credit } from "../domain/credit";
export default function BankLoanDetails({
  credit,
  reload,
}: {
  credit: Credit;
  reload(): void;
}) {
  const { credits } = useServices();
  const { t } = usePreferences();
  const { formatMoney } = useCurrency();
  const [schedule, setSchedule] = useState(false);
  const [draw, setDraw] = useState(false);
  if (!credit.bankLoan) return null;
  const bank = credit.bankLoan;
  const projection = bankProjection(credit.initialAmount, bank);
  return (
    <>
      <Label>
        {t(
          bank.rateType === "fixed"
            ? "bankFixed"
            : bank.rateType === "variable"
              ? "bankVariable"
              : "bankRevolving",
        )}{" "}
        · {bank.annualRate} % · {bank.termMonths} {t("bankMonths")}
      </Label>
      <Label>
        {t("bankMonthly")} : {formatMoney(projection.monthlyPayment)}
      </Label>
      <Label muted>
        {t("bankCost")} : {formatMoney(projection.totalCost)}
      </Label>
      <Label muted>{t("bankForecastHint")}</Label>
      {bank.rateType === "revolving" && (
        <>
          <Label>
            {t("bankAvailable")} :{" "}
            {formatMoney(bank.creditLimit! - credit.remainingAmount)}
          </Label>
          <Button
            title={t("bankDraw")}
            secondary
            onPress={() => setDraw(true)}
          />
        </>
      )}
      <Button
        title={t("bankSchedule")}
        secondary
        onPress={() => setSchedule((value) => !value)}
      />
      {schedule &&
        projection.schedule.map((row) => (
          <Label key={row.number}>
            {row.date} : {formatMoney(row.amount)} ({t("bankPaidInterest")} :{" "}
            {formatMoney(row.interest)})
          </Label>
        ))}
      {draw && (
        <CreationModal
          title={t("bankDraw")}
          close={() => setDraw(false)}
          saved={() => {
            setDraw(false);
            reload();
          }}
          fields={[{ key: "amount", label: t("amount"), amount: true }]}
          submit={(values) => {
            const amount = parseAmount(values.amount);
            if (amount > bank.creditLimit! - credit.remainingAmount)
              throw new Error(t("bankLimitError"));
            return credits.update(credit.id, {
              initialAmount:
                (Math.round(credit.initialAmount * 100) +
                  Math.round(amount * 100)) /
                100,
            });
          }}
        />
      )}
    </>
  );
}
