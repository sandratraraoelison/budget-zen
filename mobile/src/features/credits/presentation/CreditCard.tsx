import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Credit } from "../domain/credit";
import { usePreferences } from "../../settings/PreferencesProvider";
import { useCurrency } from "../../settings/CurrencyProvider";
import { Button } from "../../../shared/ui/components";
import BankLoanDetails from "./BankLoanDetails";

export default function CreditCard({
  credit,
  pay,
  edit,
  reload,
}: {
  credit: Credit;
  pay(): void;
  edit(): void;
  reload(): void;
}) {
  const { colors, dark, t, locale } = usePreferences();
  const { formatMoney } = useCurrency();
  const [details, setDetails] = useState(false);
  const borrowed = credit.type === "borrowed";
  const accent = borrowed
    ? dark
      ? "#fca5a5"
      : "#b91c1c"
    : dark
      ? "#6ee7b7"
      : "#047857";
  const solid = borrowed ? "#dc2626" : "#059669";
  const tint = borrowed ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)";
  const progress =
    credit.initialAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (1 - credit.remainingAmount / credit.initialAmount) * 100,
          ),
        )
      : 0;
  const paid = credit.remainingAmount === 0;
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: borrowed ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)",
        shadowColor: solid,
        shadowOpacity: dark ? 0.2 : 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View
        style={{ borderRadius: 21, overflow: "hidden", padding: 16, gap: 10 }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -55,
            right: -45,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: tint,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: tint,
              flexShrink: 1,
            }}
          >
            <Ionicons
              name={
                credit.bankLoan
                  ? "business-outline"
                  : borrowed
                    ? "arrow-down-outline"
                    : "arrow-up-outline"
              }
              color={accent}
              size={16}
            />
            <Text
              style={{
                color: accent,
                fontSize: 12,
                fontWeight: "700",
                flexShrink: 1,
              }}
            >
              {t(
                credit.bankLoan
                  ? "bankCredit"
                  : borrowed
                    ? "creditBorrowed"
                    : "creditLent",
              )}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: paid ? (dark ? "#6ee7b7" : "#047857") : colors.muted,
              flexShrink: 1,
            }}
          >
            {t(paid ? "repaid" : "creditOngoing")}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
          {credit.contact}
        </Text>
        <View style={{ gap: 3 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {t(borrowed ? "remainingToRepay" : "remainingToReceive")}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={{
              color: accent,
              fontSize: 25,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatMoney(credit.remainingAmount)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {t("creditInitial")} : {formatMoney(credit.initialAmount)}
          </Text>
          <Text style={{ color: accent, fontSize: 12 }}>
            {Math.round(progress)} % {t("creditPaidProgress")}
          </Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t("creditPaidProgress")}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
          style={{
            height: 5,
            backgroundColor: colors.soft,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 5,
              width: `${progress}%`,
              backgroundColor: solid,
              borderRadius: 5,
            }}
          />
        </View>
        {credit.endDate && (
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {t("endDate")} :{" "}
            {new Date(`${credit.endDate}T12:00:00`).toLocaleDateString(locale)}
          </Text>
        )}
        {!paid && (
          <Pressable
            accessibilityRole="button"
            onPress={pay}
            style={({ pressed }) => ({
              minHeight: 46,
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: solid,
              opacity: pressed ? 0.75 : 1,
              flexDirection: "row",
              gap: 8,
            })}
          >
            <Ionicons
              name={
                borrowed
                  ? "arrow-up-circle-outline"
                  : "arrow-down-circle-outline"
              }
              color="#fff"
              size={19}
            />
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                flexShrink: 1,
                textAlign: "center",
              }}
            >
              {t(borrowed ? "repay" : "receiveRepayment")}
            </Text>
          </Pressable>
        )}
        {credit.bankLoan && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: details }}
              onPress={() => setDetails((value) => !value)}
              style={{
                minHeight: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: accent,
                  fontSize: 13,
                  fontWeight: "600",
                  flexShrink: 1,
                }}
              >
                {t("creditBankDetails")}
              </Text>
              <Ionicons
                name={details ? "chevron-up-outline" : "chevron-down-outline"}
                size={18}
                color={accent}
              />
            </Pressable>
            {details && (
              <>
                <BankLoanDetails credit={credit} reload={reload} />
                <Button title={t("bankEdit")} secondary onPress={edit} />
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}
