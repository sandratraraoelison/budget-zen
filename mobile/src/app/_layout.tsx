import NotificationHost from "../shared/ui/NotificationHost";
import { NotificationProvider } from "../shared/ui/NotificationProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ServicesProvider, useServices } from "../composition/ServicesProvider";
import {
  PreferencesProvider,
  usePreferences,
} from "../features/settings/PreferencesProvider";
import { Button, ErrorMessage, Loading, Screen } from "../shared/ui/components";
function Navigation() {
  const { session } = useServices();
  const { dark } = usePreferences();
  if (session.loading) return <Loading />;
  if (session.error)
    return (
      <Screen>
        <ErrorMessage message={session.error} />
        <Button
          title="Réessayer / Retry"
          onPress={() => void session.restore()}
        />
      </Screen>
    );
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!session.user}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={!!session.user}>
          <Stack.Screen name="(workspace)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <PreferencesProvider>
      <NotificationProvider>
        <ServicesProvider>
          <Navigation />
          <NotificationHost />
        </ServicesProvider>
      </NotificationProvider>
    </PreferencesProvider>
  );
}
