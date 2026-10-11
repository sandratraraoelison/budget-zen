import NewProjectModal from "./NewProjectModal";
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
export default function ProjectsScreen() {
  const { projects } = useServices();
  const { formatMoney } = useCurrency();
  const { t } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => projects.list(signal),
    [projects],
  );
  const resource = useResource(load);
  const [creating, setCreating] = useState(false);
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("projects")}
        subtitle={t("projectsHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newProject")}
        icon="add-circle-outline"
        onPress={() => setCreating(true)}
      />
      <ResourceState {...resource} empty={!resource.data?.length} />
      {resource.data?.map((item) => (
        <Card key={item.id}>
          <Heading title={item.name} />
          <Label muted>
            {t(item.status === "en-cours" ? "active" : "completed")}
          </Label>
          <ProgressBar
            value={
              item.initialFund > 0
                ? (item.initialFund - item.currentFund) / item.initialFund
                : 0
            }
          />
          <Label>
            {t("remaining")} · {formatMoney(item.currentFund)} /{" "}
            {formatMoney(item.initialFund)}
          </Label>
        </Card>
      ))}
      {creating && (
        <NewProjectModal
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
