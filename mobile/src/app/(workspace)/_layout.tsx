import { Tabs } from "expo-router/js-tabs";
import { CurrencyProvider } from "../../features/settings/CurrencyProvider";
import { usePreferences } from "../../features/settings/PreferencesProvider";
export default function WorkspaceLayout() {
  const { colors, t } = usePreferences();
  return (
    <CurrencyProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: t("dashboard"), tabBarLabel: t("dashboard") }}
        />
        <Tabs.Screen name="projects" options={{ title: t("projects") }} />
        <Tabs.Screen name="credits" options={{ title: t("credits") }} />
        <Tabs.Screen name="business" options={{ title: t("business") }} />
        <Tabs.Screen name="settings" options={{ title: t("settings") }} />
      </Tabs>
    </CurrencyProvider>
  );
}
