import NewBusinessTransactionModal from "./NewBusinessTransactionModal";
import { Text } from "react-native";
import { useCallback, useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import {
  Button,
  Card,
  Heading,
  IconButton,
  Label,
  Screen,
} from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
export default function BusinessScreen() {
  const { business } = useServices();
  const { formatMoney } = useCurrency();
  const { t, colors } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => business.analytics(signal),
    [business],
  );
  const resource = useResource(load);
  const [creating, setCreating] = useState(false);
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("business")}
        subtitle={t("businessHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newBusinessTransaction")}
        icon="add-circle-outline"
        onPress={() => setCreating(true)}
      />
      <ResourceState {...resource} />
      {resource.data && (
        <>
          <Card>
            <Label>{t("income")}</Label>
            <Text
              style={{ fontSize: 28, fontWeight: "700", color: colors.text }}
            >
              {formatMoney(resource.data.totals.revenue)}
            </Text>
          </Card>
          <Card>
            <Label>{t("expenses")}</Label>
            <Text
              style={{ fontSize: 28, fontWeight: "700", color: colors.text }}
            >
              {formatMoney(resource.data.totals.expenses)}
            </Text>
          </Card>
          <Card>
            <Label>{t("profit")}</Label>
            <Text
              style={{ fontSize: 28, fontWeight: "700", color: colors.text }}
            >
              {formatMoney(resource.data.totals.profit)}
            </Text>
          </Card>
        </>
      )}
      {creating && (
        <NewBusinessTransactionModal
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
