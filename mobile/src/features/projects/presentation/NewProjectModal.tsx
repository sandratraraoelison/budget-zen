import type { Project } from "../domain/project";
import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import { parseAmount } from "../../budget/domain/budget";
import {
  calendarDate,
  requiredText,
  today,
} from "../../../shared/domain/form-validation";
type Props = { close(): void; saved(): void; project?: Project };
export default function NewProjectModal(props: Props) {
  const { projects } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t(props.project ? "editProject" : "newProject")}
      fields={[
        { key: "name", label: t("projectName"), initial: props.project?.name },
        {
          key: "initialFund",
          label: t("projectFundingTarget"),
          amount: true,
          initial: String(props.project?.initialFund ?? 0),
        },
        {
          key: "savedFund",
          label: t("projectAlreadySaved"),
          amount: true,
          initial: String(
            props.project?.savedFund ??
              (props.project ? props.project.initialFund : 0),
          ),
        },
        {
          key: "startDate",
          label: t("startDate"),
          initial: props.project?.startDate ?? today(),
          date: true,
        },
        {
          key: "targetDate",
          label: t("projectTargetDate"),
          date: true,
          optional: true,
          minimumField: "startDate",
          initial: props.project?.targetDate ?? "",
        },
      ]}
      submit={(values) => {
        const startDate = calendarDate(values.startDate, t("startDate"))!;
        const targetDate =
          calendarDate(values.targetDate, t("projectTargetDate"), true) ?? null;
        if (targetDate && targetDate < startDate)
          throw new Error(t("invalidDateRange"));
        const input = {
          savedFund: Number(values.savedFund),
          name: requiredText(values.name, t("projectName")),
          initialFund: /^0+(?:[.,]0{1,2})?$/.test(values.initialFund.trim())
            ? 0
            : parseAmount(values.initialFund),
          startDate,
          targetDate,
        };
        return props.project
          ? projects.update(props.project.id, input)
          : projects.create(input);
      }}
    />
  );
}
