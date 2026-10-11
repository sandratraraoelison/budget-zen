import { Tabs } from "expo-router/js-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Loading } from "../../shared/ui/components";
import { CurrencyProvider } from "../../features/settings/CurrencyProvider";
import { usePreferences } from "../../features/settings/PreferencesProvider";
const icons: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
  index: "home-outline",
  projects: "folder-outline",
  credits: "card-outline",
  business: "bar-chart-outline",
  settings: "settings-outline",
};
export default function WorkspaceLayout() {
  const { colors, t } = usePreferences();
  const insets = useSafeAreaInsets();
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);
  if (!fontsLoaded && !fontError) return <Loading />;
  return (
    <CurrencyProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: "700" },
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 68 + Math.max(insets.bottom, 10),
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
            elevation: 0,
          },
          tabBarItemStyle: { paddingVertical: 2 },
          tabBarLabelPosition: "below-icon",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 3 },
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, focused }) =>
            fontsLoaded ? (
              <View
                style={{
                  width: 44,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused ? colors.accentSoft : "transparent",
                }}
              >
                <Ionicons
                  name={icons[route.name] ?? "ellipse-outline"}
                  size={22}
                  color={color}
                />
              </View>
            ) : null,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("dashboard"),
            tabBarLabel: t("home"),
            tabBarAccessibilityLabel: t("dashboard"),
          }}
        />
        <Tabs.Screen name="projects" options={{ title: t("projects") }} />
        <Tabs.Screen name="credits" options={{ title: t("credits") }} />
        <Tabs.Screen name="business" options={{ title: t("business") }} />
        <Tabs.Screen name="settings" options={{ title: t("settings") }} />
      </Tabs>
    </CurrencyProvider>
  );
}
