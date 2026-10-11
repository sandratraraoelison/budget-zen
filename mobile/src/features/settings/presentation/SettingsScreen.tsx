import { View, Text } from "react-native";
import { useCallback, useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Card,
  Choice,
  Heading,
  ErrorMessage,
  Label,
  Screen,
} from "../../../shared/ui/components";
import CurrencyPicker from "./CurrencyPicker";
import CategoryManager from "../../budget/presentation/CategoryManager";
import { useResource } from "../../../shared/application/useResource";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../CurrencyProvider";
import { usePreferences } from "../PreferencesProvider";
export default function SettingsScreen() {
  const { session, budget } = useServices();
  const loadCategories = useCallback(
    (signal: AbortSignal) => budget.summary(signal),
    [budget],
  );
  const categories = useResource(loadCategories);
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
        <CurrencyPicker
          value={code ?? currency.currency}
          onChange={setCode}
          disabled={pending || currency.loading}
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
      <ResourceState
        loading={categories.loading && !categories.data}
        error={categories.error}
        reload={categories.reload}
      />
      {categories.data && (
        <CategoryManager summary={categories.data} reload={categories.reload} />
      )}
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
