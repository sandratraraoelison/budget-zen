import NewBusinessTransactionModal from "./NewBusinessTransactionModal";
import { Alert, ScrollView, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { useServices } from "../../../composition/ServicesProvider";
import { useResource } from "../../../shared/application/useResource";
import {
  Button,
  Card,
  Choice,
  Field,
  Heading,
  IconButton,
  Label,
  ProgressBar,
  Screen,
} from "../../../shared/ui/components";
import DateField from "../../../shared/ui/DateField";
import ResourceState from "../../../shared/ui/ResourceState";
import { today } from "../../../shared/domain/form-validation";
import { useCurrency } from "../../settings/CurrencyProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import type {
  BusinessTimeRange,
  BusinessTransaction,
} from "../domain/business";

export default function BusinessScreen() {
  const { business } = useServices();
  const { formatMoney } = useCurrency();
  const { t, colors, locale } = usePreferences();
  const [range, setRange] = useState<BusinessTimeRange>("month");
  const [anchor, setAnchor] = useState(today);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [count, setCount] = useState(20);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BusinessTransaction>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [analytics, transactions] = await Promise.all([
        business.analytics(signal, { timeRange: range, date: anchor }),
        business.list(signal),
      ]);
      return { analytics, transactions };
    },
    [business, range, anchor],
  );
  const resource = useResource(load);
  const analytics = resource.data?.analytics;
  const transactions = (resource.data?.transactions ?? [])
    .filter(
      (item) =>
        analytics &&
        Date.parse(item.date) >= Date.parse(analytics.from) &&
        Date.parse(item.date) < Date.parse(analytics.toExclusive) &&
        (type === "all" || item.type === type) &&
        `${item.category} ${item.description}`
          .toLocaleLowerCase(locale)
          .includes(search.toLocaleLowerCase(locale)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  function remove(transaction: BusinessTransaction) {
    Alert.alert(t("delete"), t("businessDelete"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          setPending(true);
          setError("");
          void business
            .remove(transaction.id)
            .then(resource.reload)
            .catch((error) => setError(error.message))
            .finally(() => setPending(false));
        },
      },
    ]);
  }
  return (
    <Screen
      onRefresh={resource.reload}
      refreshing={resource.loading && !!resource.data}
    >
      <Heading
        title={t("business")}
        subtitle={t("businessHint")}
        action={
          <IconButton
            icon="refresh-outline"
            label={t("refresh")}
            onPress={resource.reload}
          />
        }
      />
      <Button
        title={t("newBusinessTransaction")}
        icon="add-circle-outline"
        disabled={pending}
        onPress={() => {
          setEditing(undefined);
          setCreating(true);
        }}
      />
      <Card>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["month", "quarter", "year"] as const).map((value) => (
            <View key={value} style={{ flex: 1 }}>
              <Choice
                title={t(
                  value === "month"
                    ? "businessMonth"
                    : value === "quarter"
                      ? "businessQuarter"
                      : "businessYear",
                )}
                selected={range === value}
                onPress={() => setRange(value)}
              />
            </View>
          ))}
        </View>
        <DateField
          label={t("businessPeriodDate")}
          value={anchor}
          onChange={(value) => {
            if (value) setAnchor(value);
          }}
        />
        {analytics && (
          <Label muted>
            {new Date(analytics.from).toLocaleDateString(locale, {
              timeZone: "UTC",
            })}{" "}
            →{" "}
            {new Date(
              Date.parse(analytics.toExclusive) - 86400000,
            ).toLocaleDateString(locale, { timeZone: "UTC" })}
          </Label>
        )}
      </Card>
      <ResourceState {...resource} />
      {error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      {analytics && !resource.loading && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {(["revenue", "expenses", "profit"] as const).map((key) => {
              const change = analytics.change[key];
              const favorable =
                change == null ||
                (key === "expenses" ? change <= 0 : change >= 0);
              return (
                <View key={key} style={{ width: 250 }}>
                  <Card>
                    <Label muted>
                      {t(
                        key === "revenue"
                          ? "businessRevenue"
                          : key === "expenses"
                            ? "expenses"
                            : "profit",
                      )}
                    </Label>
                    <Text
                      style={{
                        color:
                          key === "profit" && analytics.totals.profit < 0
                            ? colors.danger
                            : colors.text,
                        fontWeight: "700",
                        fontSize: 25,
                      }}
                    >
                      {formatMoney(analytics.totals[key])}
                    </Text>
                    <Text
                      style={{
                        color: favorable ? colors.accent : colors.danger,
                        fontSize: 12,
                      }}
                    >
                      {change == null
                        ? t("businessNoComparison")
                        : `${change > 0 ? "+" : ""}${change.toLocaleString(locale)} % · ${t("businessPrevious")}`}
                    </Text>
                  </Card>
                </View>
              );
            })}
          </ScrollView>
          <Card>
            <Heading title={t("businessMargin")} />
            <Text
              style={{
                color:
                  analytics.totals.profit < 0 ? colors.danger : colors.accent,
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              {analytics.margin == null
                ? "—"
                : `${analytics.margin.toLocaleString(locale)} %`}
            </Text>
            <Label muted>{t("businessMarginHint")}</Label>
            <Label>
              {analytics.transactionCount} · {t("businessOperations")}
            </Label>
          </Card>
          <Card>
            <Heading title={t("businessTopExpenses")} />
            {!(analytics.expenseCategories ?? []).length && (
              <Label muted>{t("businessNoExpenses")}</Label>
            )}
            {(analytics.expenseCategories ?? []).slice(0, 5).map((category) => (
              <View key={category.category} style={{ gap: 6 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <Text style={{ flex: 1, color: colors.text }}>
                    {category.category}
                  </Text>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    {formatMoney(category.amount)}
                  </Text>
                </View>
                <ProgressBar value={category.share / 100} />
              </View>
            ))}
          </Card>
          <Card>
            <Heading title={t("history")} />
            <Field
              label={t("businessSearch")}
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setCount(20);
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["all", "income", "expense"] as const).map((value) => (
                <View key={value} style={{ flex: 1 }}>
                  <Choice
                    title={t(
                      value === "all"
                        ? "businessAllTypes"
                        : value === "income"
                          ? "income"
                          : "expenses",
                    )}
                    selected={type === value}
                    onPress={() => {
                      setType(value);
                      setCount(20);
                    }}
                  />
                </View>
              ))}
            </View>
            {!transactions.length && (
              <Label muted>{t("businessNoTransactions")}</Label>
            )}
            {transactions.slice(0, count).map((item) => (
              <View
                key={item.id}
                style={{
                  gap: 8,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Label>{item.category}</Label>
                    <Label muted>{item.description}</Label>
                    <Label muted>
                      {new Date(
                        `${item.date.slice(0, 10)}T12:00:00`,
                      ).toLocaleDateString(locale)}
                    </Label>
                  </View>
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        item.type === "income" ? colors.accent : colors.danger,
                    }}
                  >
                    {item.type === "income" ? "+" : "−"}
                    {formatMoney(item.amount)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <IconButton
                    icon="create-outline"
                    label={t("edit")}
                    disabled={pending}
                    onPress={() => {
                      setEditing(item);
                      setCreating(true);
                    }}
                  />
                  <IconButton
                    icon="trash-outline"
                    destructive
                    label={t("delete")}
                    disabled={pending}
                    onPress={() => remove(item)}
                  />
                </View>
              </View>
            ))}
            {transactions.length > count && (
              <Button
                secondary
                title={t("fundingMore")}
                onPress={() => setCount(count + 20)}
              />
            )}
          </Card>
        </>
      )}
      {creating && (
        <NewBusinessTransactionModal
          key={editing?.id ?? "create"}
          transaction={editing}
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
