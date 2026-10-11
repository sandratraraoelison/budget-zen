import { ActivityIndicator } from "react-native";
import { Button, ErrorMessage, Label } from "./components";
import { usePreferences } from "../../features/settings/PreferencesProvider";
export default function ResourceState({
  loading,
  error,
  empty,
  reload,
}: {
  loading: boolean;
  error: string;
  empty?: boolean;
  reload(): void;
}) {
  const { colors, t } = usePreferences();
  if (loading) return <ActivityIndicator color={colors.accent} />;
  if (error)
    return (
      <>
        <ErrorMessage message={error} />
        <Button title={t("retry")} onPress={reload} />
      </>
    );
  return (
    <>
      {empty && <Label muted>{t("empty")}</Label>}
      <Button secondary title={t("refresh")} onPress={reload} />
    </>
  );
}
