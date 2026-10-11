import { useCallback } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import { Card, Label, Screen } from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
export default function ProjectsScreen() {
  const { projects } = useServices();
  const { formatMoney } = useCurrency();
  const { t } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => projects.list(signal),
    [projects],
  );
  const resource = useResource(load);
  return (
    <Screen>
      <ResourceState {...resource} empty={!resource.data?.length} />
      {resource.data?.map((item) => (
        <Card key={item.id}>
          <Label>{item.name}</Label>
          <Label muted>
            {t(item.status === "en-cours" ? "active" : "completed")}
          </Label>
          <Label>
            {t("remaining")} · {formatMoney(item.currentFund)} /{" "}
            {formatMoney(item.initialFund)}
          </Label>
        </Card>
      ))}
    </Screen>
  );
}
