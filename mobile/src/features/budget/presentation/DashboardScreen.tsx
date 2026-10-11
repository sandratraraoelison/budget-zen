import { useCallback, useState } from "react";
import { Text } from "react-native";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import { Button, Card, Label, Screen } from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import TransactionModal from "./TransactionModal";
function MoneyCard({ title, value }: { title: string; value: number }) {
  const [hidden, setHidden] = useState(true);
  const { colors, t } = usePreferences();
  const { formatMoney } = useCurrency();
  return (
    <Card>
      <Label muted>{title}</Label>
      <Text
        style={{ fontSize: 28, fontWeight: "700", color: colors.text }}
        accessibilityLabel={hidden ? t("show") : undefined}
      >
        {hidden ? "••••••" : formatMoney(value)}
      </Text>
      <Button
        secondary
        title={t(hidden ? "show" : "hide")}
        onPress={() => setHidden((value) => !value)}
      />
    </Card>
  );
}
export default function DashboardScreen() {
  const { budget } = useServices();
  const { formatMoney } = useCurrency();
  const { t, locale } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => budget.summary(signal),
    [budget],
  );
  const { data, error, loading, reload } = useResource(load);
  const [modal, setModal] = useState(false);
  return (
    <Screen>
      <Button title={t("transaction")} onPress={() => setModal(true)} />
      <ResourceState loading={loading} error={error} reload={reload} />
      {data && (
        <>
          <MoneyCard title={t("balance")} value={data.balance} />
          <MoneyCard title={t("income")} value={data.totalIncome} />
          <MoneyCard title={t("expenses")} value={data.totalExpenses} />
          <Card>
            <Label>{t("budgets")}</Label>
            {!data.budgets.length && <Label muted>{t("empty")}</Label>}
            {data.budgets.map((item) => (
              <Label key={item.id}>
                {item.category} · {formatMoney(item.current)} /{" "}
                {formatMoney(item.limit)}
              </Label>
            ))}
          </Card>
          <Card>
            <Label>{t("history")}</Label>
            {!data.transactions.length && <Label muted>{t("empty")}</Label>}
            {[...data.transactions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 20)
              .map((item) => (
                <Card key={item.id}>
                  <Label>{item.description}</Label>
                  <Label muted>
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                      locale,
                    )}
                  </Label>
                  <Label>
                    {item.type === "income" ? "+" : "−"}
                    {formatMoney(item.amount)}
                  </Label>
                </Card>
              ))}
          </Card>
        </>
      )}
      {modal && (
        <TransactionModal
          close={() => setModal(false)}
          saved={() => {
            setModal(false);
            reload();
          }}
        />
      )}
    </Screen>
  );
}
