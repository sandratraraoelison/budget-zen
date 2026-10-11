import NewCreditModal from "./NewCreditModal";
import { useCallback, useState } from "react";
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
export default function CreditsScreen() {
  const { credits } = useServices();
  const { formatMoney } = useCurrency();
  const { t } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => credits.list(signal),
    [credits],
  );
  const resource = useResource(load);
  const [creating, setCreating] = useState(false);
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("credits")}
        subtitle={t("creditsHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newCredit")}
        icon="add-circle-outline"
        onPress={() => setCreating(true)}
      />
      <ResourceState {...resource} empty={!resource.data?.length} />
      {resource.data?.map((item) => (
        <Card key={item.id}>
          <Heading title={item.contact} />
          <Label muted>
            {t(item.type === "borrowed" ? "borrowed" : "lent")}
          </Label>
          <ProgressBar
            value={
              item.initialAmount > 0
                ? (item.initialAmount - item.remainingAmount) /
                  item.initialAmount
                : 0
            }
          />
          <Label>
            {t("remaining")} · {formatMoney(item.remainingAmount)} /{" "}
            {formatMoney(item.initialAmount)}
          </Label>
        </Card>
      ))}
      {creating && (
        <NewCreditModal
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
