import { useState } from "react";
import { Card, Button, Label } from "../../../shared/ui/components";
import { usePreferences } from "../../settings/PreferencesProvider";
import { useCurrency } from "../../settings/CurrencyProvider";
import type { FundingEntry } from "../domain/budget";

export default function FundingHistory({
  entries = [],
}: {
  entries?: FundingEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(20);
  const { t, locale } = usePreferences();
  const { formatMoney } = useCurrency();
  const history = [...entries]
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date));
  const reasons = {
    deposit: "fundingDeposit",
    withdrawal: "savingsWithdraw",
    adjustment: "fundingAdjustment",
    release: "fundingRelease",
    opening: "projectAlreadySaved",
  } as const;
  return (
    <Card>
      <Button
        title={`${t("fundingHistory")} (${history.length})`}
        secondary
        icon={open ? "chevron-up-outline" : "chevron-down-outline"}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <>
          <Label muted>{t("fundingCashHint")}</Label>
          {!history.length && <Label muted>{t("fundingEmpty")}</Label>}
          {history.slice(0, count).map((entry) => (
            <Card key={`${entry.source}:${entry.id}`}>
              <Label>{entry.goalName}</Label>
              <Label muted>
                {t(reasons[entry.reason])} ·{" "}
                {t(entry.source === "project" ? "projects" : "savingsTitle")}
              </Label>
              <Label>
                {entry.amount > 0 ? "−" : "+"}
                {formatMoney(Math.abs(entry.amount))}
              </Label>
              <Label muted>{new Date(entry.date).toLocaleString(locale)}</Label>
            </Card>
          ))}
          {history.length > count && (
            <Button
              secondary
              title={t("fundingMore")}
              onPress={() => setCount(count + 20)}
            />
          )}
        </>
      )}
    </Card>
  );
}
