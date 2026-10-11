import { useCallback } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import { Card, Label, Screen } from "../../../shared/ui/components";
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
  return (
    <Screen>
      <ResourceState {...resource} empty={!resource.data?.length} />
      {resource.data?.map((item) => (
        <Card key={item.id}>
          <Label>{item.contact}</Label>
          <Label muted>
            {t(item.type === "borrowed" ? "borrowed" : "lent")}
          </Label>
          <Label>
            {t("remaining")} · {formatMoney(item.remainingAmount)} /{" "}
            {formatMoney(item.initialAmount)}
          </Label>
        </Card>
      ))}
    </Screen>
  );
}
