import type { Transaction } from "../types";
import { sumAmounts } from "../../../shared/domain/money";

/** A baseline estimate using complete calendar months, including months with no expenses. */
export function spendingForecast(
  transactions: Transaction[],
  today = new Date(),
) {
  const currentMonth = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const historical = transactions.filter(
    (t) => t.type === "expense" && t.date.getTime() < currentMonth,
  );
  if (!historical.length) return [];
  const first = new Date(Math.min(...historical.map((t) => t.date.getTime())));
  const months =
    (today.getUTCFullYear() - first.getUTCFullYear()) * 12 +
    today.getUTCMonth() -
    first.getUTCMonth();
  const average =
    Math.round((sumAmounts(historical.map((t) => t.amount)) * 100) / months) /
    100;
  return Array.from({ length: 6 }, (_, index) => ({
    month: new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + index, 1),
    )
      .toISOString()
      .slice(0, 7),
    amount: average,
  }));
}
