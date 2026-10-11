import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreferences } from "../../features/settings/PreferencesProvider";
import { useNotifications } from "./NotificationProvider";

/** Also mount inside native modals, whose surface sits above the root view. */
export default function NotificationHost({
  inModal = false,
}: {
  inModal?: boolean;
}) {
  const { notice, dismiss } = useNotifications();
  const { colors, t, language } = usePreferences();
  const insets = useSafeAreaInsets();
  if (!notice) return null;
  const error = notice.kind === "error";
  const info = notice.kind === "queued";
  const tint = error ? colors.danger : info ? colors.blue : colors.accent;
  const title = t(
    error ? "operationFailed" : info ? "waitingSync" : "operationDone",
  );
  const message =
    notice.message ??
    (notice.kind === "error" ? t("operationFailed") : t(notice.kind));
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: (inModal ? 0 : insets.top) + 12,
        left: 16,
        right: 16,
        zIndex: 1000,
        alignItems: "center",
      }}
    >
      <View
        accessibilityLiveRegion={error ? "assertive" : "polite"}
        accessibilityRole="alert"
        style={{
          width: "100%",
          maxWidth: 440,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          padding: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: tint,
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: error
              ? colors.coralSoft
              : info
                ? colors.blueSoft
                : colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={
              error
                ? "alert-circle-outline"
                : info
                  ? "cloud-upload-outline"
                  : "checkmark-circle-outline"
            }
            size={22}
            color={tint}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "700",
              lineHeight: 20,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
            {message}
          </Text>
        </View>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={
            language === "fr"
              ? "Fermer la notification"
              : "Dismiss notification"
          }
          hitSlop={6}
          style={({ pressed }) => ({
            minWidth: 44,
            minHeight: 44,
            margin: -6,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: pressed ? colors.soft : "transparent",
          })}
        >
          <Ionicons name="close" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}
