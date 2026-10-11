import { Alert, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useServices } from "../../composition/ServicesProvider";
import { usePreferences } from "../../features/settings/PreferencesProvider";
export default function SyncBanner() {
  const { sync, http, session } = useServices();
  const { colors, t } = usePreferences();
  if (!session.user || (!sync.offline && !sync.pending && !sync.error))
    return null;
  const title = sync.syncing
    ? t("synchronizing")
    : sync.offline
      ? t("offline")
      : t("waitingSync");
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: colors.accentSoft,
        padding: 14,
        borderRadius: 16,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Ionicons
          name={sync.offline ? "cloud-offline-outline" : "sync-outline"}
          size={20}
          color={colors.accent}
        />
        <Text style={{ color: colors.text, flex: 1, fontWeight: "600" }}>
          {title}
        </Text>
      </View>
      {sync.pending > 0 && (
        <Text style={{ color: colors.muted }}>
          {sync.pending} {t("pendingChanges")}
        </Text>
      )}
      {sync.error !== "" && (
        <Text style={{ color: colors.danger }}>{sync.error}</Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={sync.syncing}
        onPress={() => void http.retry().catch(() => {})}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text style={{ color: colors.accent, fontWeight: "600" }}>
          {t("retrySync")}
        </Text>
      </Pressable>
      {sync.failed > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(t("discardFailed"), t("discardHint"), [
              { text: t("cancel"), style: "cancel" },
              {
                text: t("discardFailed"),
                style: "destructive",
                onPress: () => void http.discardFailed().catch(() => {}),
              },
            ])
          }
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text style={{ color: colors.danger }}>{t("discardFailed")}</Text>
        </Pressable>
      )}
    </View>
  );
}
