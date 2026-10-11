import { useState } from "react";
import { Alert } from "react-native";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Card,
  Heading,
  IconButton,
  Label,
  ProgressBar,
} from "../../../shared/ui/components";
import CreationModal from "../../../shared/ui/CreationModal";
import {
  calendarDate,
  requiredText,
  today,
} from "../../../shared/domain/form-validation";
import { usePreferences } from "../../settings/PreferencesProvider";
import { useCurrency } from "../../settings/CurrencyProvider";
import { parseAmount, type SavingsGoal } from "../domain/budget";
import { savingsPlan } from "../domain/savings";
export default function SavingsSection({
  goals,
  reload,
}: {
  goals: SavingsGoal[];
  reload(): void;
}) {
  const { budget } = useServices();
  const { t } = usePreferences();
  const { formatMoney } = useCurrency();
  const [form, setForm] = useState<{
    mode: "create" | "edit" | "add" | "withdraw";
    goal?: SavingsGoal;
  } | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  function remove(goal: SavingsGoal) {
    Alert.alert(t("savingsDelete"), goal.name, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("savingsDelete"),
        style: "destructive",
        onPress: () => {
          setDeleting(true);
          setError("");
          void budget
            .removeSavings(goal.id)
            .then(reload)
            .catch((error) => setError(error.message))
            .finally(() => setDeleting(false));
        },
      },
    ]);
  }
  return (
    <>
      <Heading title={t("savingsTitle")} />
      <Button
        title={t("savingsNew")}
        icon="add-circle-outline"
        disabled={deleting}
        onPress={() => setForm({ mode: "create" })}
      />
      <Label muted>{t("savingsHint")}</Label>
      {!goals.length && <Label muted>{t("savingsEmpty")}</Label>}
      {!!error && <Label>{error}</Label>}
      {goals.map((goal) => {
        const plan = savingsPlan(goal, today());
        return (
          <Card key={goal.id} compact>
            <Heading
              title={goal.name}
              action={
                <IconButton
                  icon="create-outline"
                  label={t("savingsEdit")}
                  onPress={() => setForm({ mode: "edit", goal })}
                />
              }
            />
            <Label>
              {formatMoney(goal.current)} / {formatMoney(goal.target)}
            </Label>
            <ProgressBar value={plan.progress / 100} />
            <Label muted>
              {Math.round(plan.progress)} % · {goal.deadline}
            </Label>
            <Label>
              {plan.achieved
                ? t("savingsAchieved")
                : plan.days < 0
                  ? t("projectOverdue")
                  : plan.days === 0
                    ? t("projectToday")
                    : `${plan.days} ${t("projectDaysLeft")}`}
            </Label>
            {!plan.achieved && (
              <Label>
                {t("savingsRemaining")} : {formatMoney(plan.remaining)}
              </Label>
            )}
            {!plan.achieved && plan.monthly !== undefined && (
              <Label muted>
                {t("savingsMonthly")} : {formatMoney(plan.monthly)}
              </Label>
            )}
            <Button
              title={t("savingsAdd")}
              disabled={deleting}
              onPress={() => setForm({ mode: "add", goal })}
            />
            <Button
              title={t("savingsWithdraw")}
              secondary
              disabled={deleting || goal.current === 0}
              onPress={() => setForm({ mode: "withdraw", goal })}
            />
            <Button
              title={t("savingsDelete")}
              secondary
              disabled={deleting}
              onPress={() => remove(goal)}
            />
          </Card>
        );
      })}
      {form && (
        <CreationModal
          title={t(
            form.mode === "create"
              ? "savingsNew"
              : form.mode === "edit"
                ? "savingsEdit"
                : form.mode === "add"
                  ? "savingsAdd"
                  : "savingsWithdraw",
          )}
          close={() => setForm(null)}
          saved={() => {
            setForm(null);
            reload();
          }}
          fields={
            form.mode === "create" || form.mode === "edit"
              ? [
                  {
                    key: "name",
                    label: t("savingsName"),
                    initial: form.goal?.name,
                  },
                  {
                    key: "target",
                    label: t("savingsTarget"),
                    amount: true,
                    initial: form.goal ? String(form.goal.target) : "",
                  },
                  {
                    key: "deadline",
                    label: t("projectTargetDate"),
                    date: true,
                    initial: form.goal?.deadline ?? "",
                  },
                ]
              : [{ key: "amount", label: t("amount"), amount: true }]
          }
          submit={(values) => {
            if (form.mode === "create" || form.mode === "edit") {
              const input = {
                name: requiredText(values.name, t("savingsName")),
                target: parseAmount(values.target),
                deadline: calendarDate(
                  values.deadline,
                  t("projectTargetDate"),
                )!,
              };
              return form.mode === "create"
                ? budget.createSavings(input)
                : budget.updateSavings(form.goal!.id, input);
            }
            return budget.contributeSavings(
              form.goal!.id,
              parseAmount(values.amount),
              form.mode,
            );
          }}
        />
      )}
    </>
  );
}
