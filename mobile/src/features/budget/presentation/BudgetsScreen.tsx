import FundingHistory from "./FundingHistory";
import SavingsSection from "./SavingsSection";
import { useCallback, useState } from "react";
import { Text } from "react-native";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import {
  Button,
  Card,
  Heading,
  IconButton,
  Label,
  ProgressBar,
  Screen,
} from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import NewBudgetModal from "./NewBudgetModal";
export default function BudgetsScreen() {
  const { budget } = useServices();
  const { formatMoney } = useCurrency();
  const { t, colors } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => budget.summary(signal),
    [budget],
  );
  const resource = useResource(load);
  const [creating, setCreating] = useState(false);
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("budgets")}
        subtitle={t("budgetsHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newBudget")}
        icon="add-circle-outline"
        onPress={() => setCreating(true)}
      />
      <ResourceState
        {...resource}
        empty={resource.data?.budgets.length === 0}
      />
      {resource.data?.budgets.map((item) => {
        const remaining =
          (Math.round(item.limit * 100) - Math.round(item.current * 100)) / 100;
        return (
          <Card key={item.id}>
            <Heading title={item.customCategoryName ?? t(item.category)} />
            <ProgressBar
              value={item.limit > 0 ? item.current / item.limit : 0}
            />
            <Label muted>
              {formatMoney(item.current)} / {formatMoney(item.limit)}
            </Label>
            <Text
              style={{
                color: remaining < 0 ? colors.danger : colors.accent,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {t("remaining")} · {formatMoney(remaining)}
            </Text>
          </Card>
        );
      })}
      {resource.data && (
        <SavingsSection
          goals={resource.data.savingsGoals ?? []}
          reload={resource.reload}
        />
      )}
      <FundingHistory entries={resource.data?.fundingHistory} />
      {creating && (
        <NewBudgetModal
          summary={resource.data}
          close={() => setCreating(false)}
          saved={() => {
            setCreating(false);
            resource.reload();
          }}
        />
      )}
    </Screen>
  );
}
