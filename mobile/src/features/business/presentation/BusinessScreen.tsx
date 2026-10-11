import { useCallback } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import { Card, Label, Screen } from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
export default function BusinessScreen() {
  const { business } = useServices();
  const { formatMoney } = useCurrency();
  const { t } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => business.analytics(signal),
    [business],
  );
  const resource = useResource(load);
  return (
    <Screen>
      <ResourceState {...resource} />
      {resource.data && (
        <>
          <Card>
            <Label>{t("income")}</Label>
            <Label>{formatMoney(resource.data.totals.revenue)}</Label>
          </Card>
          <Card>
            <Label>{t("expenses")}</Label>
            <Label>{formatMoney(resource.data.totals.expenses)}</Label>
          </Card>
          <Card>
            <Label>{t("profit")}</Label>
            <Label>{formatMoney(resource.data.totals.profit)}</Label>
          </Card>
        </>
      )}
    </Screen>
  );
}
