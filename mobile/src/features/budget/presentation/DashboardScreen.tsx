import { useCallback, useState, type ComponentProps } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import {
  Button,
  ActionTile,
  Card,
  EmptyState,
  Heading,
  IconButton,
  Label,
  ProgressBar,
  Screen,
} from "../../../shared/ui/components";
import ResourceState from "../../../shared/ui/ResourceState";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import TransactionModal from "./TransactionModal";

function MoneyCard({
  title,
  value,
  icon,
  featured = false,
  tone = "blue",
}: {
  title: string;
  value: number;
  icon: ComponentProps<typeof Ionicons>["name"];
  featured?: boolean;
  tone?: "blue" | "coral";
}) {
  const [hidden, setHidden] = useState(true);
  const { colors, t } = usePreferences();
  const { formatMoney } = useCurrency();
  return (
    <View
      style={{
        borderRadius: 28,
        backgroundColor: featured
          ? colors.primary
          : tone === "blue"
            ? colors.blueSoft
            : colors.coralSoft,
        padding: 24,
        gap: 28,
        overflow: "hidden",
        minHeight: 200,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 230,
          height: 230,
          borderRadius: 115,
          backgroundColor: featured ? "#ffffff14" : "#ffffff30",
          right: -85,
          top: -100,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: featured ? "#ffffff0c" : "#ffffff30",
          right: -40,
          bottom: -150,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Ionicons
          name={icon}
          size={23}
          color={
            featured ? "#fff" : tone === "blue" ? colors.blue : colors.coral
          }
        />
        <IconButton
          icon={hidden ? "eye-off-outline" : "eye-outline"}
          label={`${t(hidden ? "show" : "hide")}: ${title}`}
          onPress={() => setHidden((value) => !value)}
        />
      </View>
      <View style={{ gap: 8 }}>
        <Text
          style={{ fontSize: 14, color: featured ? "#eeeaff" : colors.muted }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            letterSpacing: -0.5,
            color: featured ? "#fff" : colors.text,
          }}
        >
          {hidden ? "••••••" : formatMoney(value)}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(
    360,
    Math.max(220, (Math.min(width, 720) - 40) * 0.86),
  );
  const { budget } = useServices();
  const { formatMoney } = useCurrency();
  const { t, locale, colors } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) => budget.summary(signal),
    [budget],
  );
  const { data, error, loading, reload } = useResource(load);
  const [modal, setModal] = useState(false);
  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <Heading
        title={t("overview")}
        subtitle={t("dashboardHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={reload}
          />
        }
      />
      <ResourceState loading={loading && !data} error={error} reload={reload} />
      {data && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            style={{ flexGrow: 0 }}
            snapToInterval={cardWidth + 12}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            <View style={{ width: cardWidth }}>
              <MoneyCard
                title={t("balance")}
                value={data.balance}
                icon="wallet-outline"
                featured
              />
            </View>
            <View style={{ width: cardWidth }}>
              <MoneyCard
                title={t("income")}
                value={data.totalIncome}
                icon="arrow-down-outline"
              />
            </View>
            <View style={{ width: cardWidth }}>
              <MoneyCard
                title={t("expenses")}
                value={data.totalExpenses}
                icon="arrow-up-outline"
                tone="coral"
              />
            </View>
          </ScrollView>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              textAlign: "center",
              marginTop: -10,
            }}
          >
            {t("swipeHint")}
          </Text>
        </>
      )}
      <Heading title={t("quickActions")} />
      <Button
        title={t("transaction")}
        icon="add-circle-outline"
        onPress={() => setModal(true)}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {(["projects", "credits", "business"] as const).map((destination) => (
          <ActionTile
            key={destination}
            title={t(destination)}
            icon={
              destination === "projects"
                ? "folder-outline"
                : destination === "credits"
                  ? "card-outline"
                  : "bar-chart-outline"
            }
            onPress={() => router.navigate(`/(workspace)/${destination}`)}
          />
        ))}
      </View>
      {data && (
        <>
          <Card>
            <Heading
              title={t("budgets")}
              action={
                <IconButton
                  icon="arrow-forward-outline"
                  label={t("budgets")}
                  onPress={() => router.navigate("/(workspace)/budgets")}
                />
              }
            />
            {!data.budgets.length && (
              <EmptyState title={t("noBudgets")} icon="pie-chart-outline" />
            )}
            {data.budgets.map((item) => (
              <View key={item.id} style={{ gap: 10, paddingVertical: 8 }}>
                <Label>{item.customCategoryName ?? t(item.category)}</Label>
                <ProgressBar
                  value={item.limit > 0 ? item.current / item.limit : 0}
                />
                <Label muted>
                  {formatMoney(item.current)} / {formatMoney(item.limit)}
                </Label>
              </View>
            ))}
          </Card>
          <Card>
            <Heading title={t("history")} />
            {!data.transactions.length && (
              <EmptyState
                title={t("noTransactions")}
                description={t("transactionHint")}
                icon="receipt-outline"
              />
            )}
            {[...data.transactions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 20)
              .map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: colors.soft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={
                        item.type === "income"
                          ? "arrow-down-outline"
                          : "arrow-up-outline"
                      }
                      size={18}
                      color={
                        item.type === "income" ? colors.accent : colors.danger
                      }
                    />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Label>
                      {item.customCategoryName &&
                      (!item.description.trim() ||
                        /^(?:\u2754\s*)?autres$/i.test(item.description))
                        ? item.customCategoryName
                        : item.description}
                    </Label>
                    {item.customCategoryName && (
                      <Label muted>{item.customCategoryName}</Label>
                    )}
                    {item.syncStatus === "pending" && (
                      <Text style={{ color: colors.accent, fontSize: 12 }}>
                        {t("pendingTransaction")}
                      </Text>
                    )}
                    <Label muted>
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                        locale,
                      )}
                    </Label>
                  </View>
                  <Text
                    style={{
                      maxWidth: "46%",
                      color:
                        item.type === "income" ? colors.accent : colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                      textAlign: "right",
                    }}
                  >
                    {item.type === "income" ? "+" : "−"}
                    {formatMoney(item.amount)}
                  </Text>
                </View>
              ))}
          </Card>
        </>
      )}
      {modal && (
        <TransactionModal
          summary={data}
          close={() => setModal(false)}
          saved={() => {
            setModal(false);
            reload();
          }}
        />
      )}
    </Screen>
  );
}
