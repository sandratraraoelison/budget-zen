import { View, Text } from "react-native";
import { useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Card,
  Choice,
  Heading,
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              height: 52,
              width: 52,
              borderRadius: 18,
              backgroundColor: prefs.colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: prefs.colors.accent,
                fontSize: 22,
                fontWeight: "700",
              }}
            >
              {session.user?.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Heading
              title={session.user?.name ?? "BudgetZen"}
              subtitle={session.user?.email}
            />
          </View>
        </View>
      </Card>
      <Card>
        <Heading title={t("appearance")} />
        <Label muted>{t("theme")}</Label>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["light", "dark"] as const).map((theme) => (
            <View key={theme} style={{ flex: 1 }}>
              <Choice
                title={t(theme)}
                selected={theme === (prefs.dark ? "dark" : "light")}
                onPress={() => prefs.update(prefs.language, theme)}
              />
            </View>
          ))}
        </View>
        <Label muted>{t("language")}</Label>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["fr", "en"] as const).map((language) => (
            <View key={language} style={{ flex: 1 }}>
              <Choice
                title={language === "fr" ? "Français" : "English"}
                selected={prefs.language === language}
                onPress={() => prefs.update(language, prefs.theme)}
              />
            </View>
          ))}
        </View>
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
        icon="log-out-outline"
        title={t("logout")}
        secondary
        pending={pending}
        onPress={() => void logout()}
      />
    </Screen>
  );
}
