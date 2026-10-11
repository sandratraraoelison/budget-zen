import CreditCard from "./CreditCard";
import { Text, View } from "react-native";
import PaymentModal from "./PaymentModal";
import type { Credit } from "../domain/credit";
import NewCreditModal from "./NewCreditModal";
import { Fragment, useCallback, useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import {
  Button,
  Heading,
  IconButton,
  Screen,
} from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { usePreferences } from "../../settings/PreferencesProvider";
export default function CreditsScreen() {
  const { credits } = useServices();
  const { t, dark } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => credits.list(signal),
    [credits],
  );
  const resource = useResource(load);
  const [editing, setEditing] = useState<Credit | null>(null);
  const [paying, setPaying] = useState<Credit | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("credits")}
        subtitle={t("creditsHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newCredit")}
        icon="add-circle-outline"
        onPress={() => setCreating(true)}
      />
      <ResourceState {...resource} empty={!resource.data?.length} />
      {(["borrowed", "lent", "bank"] as const).map((type) => {
        const items =
          resource.data?.filter((item) =>
            type === "bank"
              ? !!item.bankLoan
              : item.type === type && !item.bankLoan,
          ) ?? [];
        if (!items.length) return null;
        return (
          <Fragment key={type}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: type === "lent" ? "#10b981" : "#ef4444",
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color:
                    type === "lent"
                      ? dark
                        ? "#6ee7b7"
                        : "#047857"
                      : dark
                        ? "#fca5a5"
                        : "#b91c1c",
                }}
              >
                {t(
                  type === "bank"
                    ? "bankCredits"
                    : type === "borrowed"
                      ? "borrowings"
                      : "loans",
                )}{" "}
                ({items.length})
              </Text>
            </View>
            {items.map((item) => (
              <CreditCard
                key={item.id}
                credit={item}
                pay={() => setPaying(item)}
                edit={() => setEditing(item)}
                reload={resource.reload}
              />
            ))}
          </Fragment>
        );
      })}
      {paying && (
        <PaymentModal
          credit={paying}
          close={() => setPaying(null)}
          saved={() => {
            setPaying(null);
            resource.reload();
          }}
        />
      )}
      {editing && (
        <NewCreditModal
          credit={editing}
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            resource.reload();
          }}
        />
      )}
      {creating && (
        <NewCreditModal
          close={() => setCreating(false)}
          saved={() => {
            setCreating(false);
            resource.reload();
          }}
        />
      )}
    </Screen>
  );
}
