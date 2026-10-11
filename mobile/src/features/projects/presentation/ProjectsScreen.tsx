import FundingHistory from "../../budget/presentation/FundingHistory";
import CreationModal from "../../../shared/ui/CreationModal";
import { parseAmount } from "../../budget/domain/budget";
import { projectTimeline } from "../domain/timeline";
import { today } from "../../../shared/domain/form-validation";
import type { Project } from "../domain/project";
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
  const { t, locale } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => projects.list(signal),
    [projects],
  );
  const resource = useResource(load);
  const [editing, setEditing] = useState<Project | null>(null);
  const [movement, setMovement] = useState<{
    project: Project;
    direction: "add" | "withdraw";
  } | null>(null);
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
      {resource.data?.map((item) => {
        const timeline = projectTimeline(item, today());
        return (
          <Card key={item.id}>
            <Heading
              title={item.name}
              action={
                <IconButton
                  icon="create-outline"
                  label={t("editProject")}
                  onPress={() => setEditing(item)}
                />
              }
            />
            <Label muted>
              {t(
                timeline.phase === "planned"
                  ? "projectPlanned"
                  : item.status === "en-cours"
                    ? "active"
                    : "completed",
              )}
            </Label>
            {item.startDate && (
              <Label muted>
                {t("startDate")} :{" "}
                {new Date(`${item.startDate}T12:00:00`).toLocaleDateString(
                  locale,
                )}
              </Label>
            )}
            {item.targetDate && (
              <Label>
                {t("projectTargetDate")} :{" "}
                {new Date(`${item.targetDate}T12:00:00`).toLocaleDateString(
                  locale,
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </Label>
            )}
            {item.status === "en-cours" &&
              timeline.targetDays !== undefined && (
                <Label>
                  {timeline.targetDays < 0
                    ? t("projectOverdue")
                    : timeline.targetDays === 0
                      ? t("projectToday")
                      : `${timeline.targetDays} ${t("projectDaysLeft")}`}
                </Label>
              )}
            <Label muted>{t("projectFundingProgress")}</Label>
            <ProgressBar
              value={
                item.initialFund > 0
                  ? Math.min(
                      1,
                      (item.savedFund ?? item.initialFund) / item.initialFund,
                    )
                  : 0
              }
            />
            <Label>
              {t("projectSaved")} ·{" "}
              {formatMoney(item.savedFund ?? item.initialFund)} /{" "}
              {formatMoney(item.initialFund)}
            </Label>
            <Label>
              {t("savingsRemaining")} :{" "}
              {formatMoney(
                Math.max(
                  0,
                  (Math.round(item.initialFund * 100) -
                    Math.round((item.savedFund ?? item.initialFund) * 100)) /
                    100,
                ),
              )}
            </Label>
            <Label muted>
              {t("projectAvailable")} : {formatMoney(item.currentFund)}
            </Label>
            {item.status === "en-cours" && (
              <>
                <Button
                  title={t("projectSetAside")}
                  icon="add-circle-outline"
                  onPress={() =>
                    setMovement({ project: item, direction: "add" })
                  }
                />
                <Button
                  title={t("savingsWithdraw")}
                  secondary
                  disabled={item.currentFund <= 0}
                  onPress={() =>
                    setMovement({ project: item, direction: "withdraw" })
                  }
                />
              </>
            )}
            <FundingHistory entries={item.history} />
          </Card>
        );
      })}
      {movement && (
        <CreationModal
          title={t(
            movement.direction === "add"
              ? "projectSetAside"
              : "savingsWithdraw",
          )}
          close={() => setMovement(null)}
          saved={() => {
            setMovement(null);
            resource.reload();
          }}
          fields={[{ key: "amount", label: t("amount"), amount: true }]}
          submit={(values) =>
            projects.contribute(
              movement.project.id,
              parseAmount(values.amount),
              movement.direction,
            )
          }
        />
      )}
      {editing && (
        <NewProjectModal
          project={editing}
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            resource.reload();
          }}
        />
      )}
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
