import { useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Label,
  Screen,
} from "../../../shared/ui/components";
import { useCurrency } from "../CurrencyProvider";
import { usePreferences } from "../PreferencesProvider";
export default function SettingsScreen() {
  const { session } = useServices();
  const prefs = usePreferences();
  const { t } = prefs;
  const currency = useCurrency();
  const [code, setCode] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setPending(true);
    setError("");
    try {
      await currency.changeCurrency(code ?? currency.currency);
      setCode(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function logout() {
    setPending(true);
    try {
      await session.logout();
    } catch (error) {
      setError((error as Error).message);
      setPending(false);
    }
  }
  return (
    <Screen>
      <Card>
        <Label>{session.user?.name}</Label>
        <Label muted>{session.user?.email}</Label>
      </Card>
      <Card>
        <Label>{t("theme")}</Label>
        <Button
          title={prefs.dark ? "☀ Light" : "☾ Dark"}
          secondary
          onPress={() =>
            prefs.update(prefs.language, prefs.dark ? "light" : "dark")
          }
        />
        <Label>{t("language")}</Label>
        <Button
          title={prefs.language === "fr" ? "English" : "Français"}
          secondary
          onPress={() =>
            prefs.update(prefs.language === "fr" ? "en" : "fr", prefs.theme)
          }
        />
      </Card>
      <Card>
        <Field
          label={`${t("currency")} · ISO 4217`}
          value={code ?? currency.currency}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={3}
          editable={!pending}
        />
        <Label muted>{t("currencyWarning")}</Label>
        <ErrorMessage message={currency.error} />
        <Button
          title={t("save")}
          pending={pending}
          disabled={currency.loading}
          onPress={() => void save()}
        />
      </Card>
      <ErrorMessage message={error} />
      <Button
        title={t("logout")}
        secondary
        pending={pending}
        onPress={() => void logout()}
      />
    </Screen>
  );
}
