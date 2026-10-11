import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { BusinessTransaction, TimeRange } from "./models";

export const businessTransactionView = ({
  amountMinor,
  ...transaction
}: BusinessTransaction) => ({ ...transaction, amount: fromMinor(amountMinor) });

function totals(transactions: BusinessTransaction[]) {
  const revenue = sumMinor(
    transactions.filter((t) => t.type === "income").map((t) => t.amountMinor),
  );
  const expenses = sumMinor(
    transactions.filter((t) => t.type === "expense").map((t) => t.amountMinor),
  );
  return { revenue, expenses, profit: revenue - expenses };
}

export function businessAnalytics(
  transactions: BusinessTransaction[],
  range: TimeRange,
  anchor: Date,
) {
  const months = range === "year" ? 12 : range === "quarter" ? 3 : 1;
  const month =
    range === "year"
      ? 0
      : range === "quarter"
        ? Math.floor(anchor.getUTCMonth() / 3) * 3
        : anchor.getUTCMonth();
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), month, 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), month + months, 1));
  const previousStart = new Date(
    Date.UTC(anchor.getUTCFullYear(), month - months, 1),
  );
  const inPeriod = (from: Date, to: Date) =>
    transactions.filter(
      (t) =>
        Date.parse(t.date) >= from.getTime() &&
        Date.parse(t.date) < to.getTime(),
    );
  const current = totals(inPeriod(start, end));
  const previous = totals(inPeriod(previousStart, start));
  const buckets =
    range === "month"
      ? Math.round((end.getTime() - start.getTime()) / 86400000)
      : months;
  const chart = Array.from({ length: buckets }, (_, index) => {
    const from =
      range === "month"
        ? new Date(Date.UTC(start.getUTCFullYear(), month, index + 1))
        : new Date(Date.UTC(start.getUTCFullYear(), month + index, 1));
    const to =
      range === "month"
        ? new Date(Date.UTC(start.getUTCFullYear(), month, index + 2))
        : new Date(Date.UTC(start.getUTCFullYear(), month + index + 1, 1));
    const bucket = totals(inPeriod(from, to));
    return {
      date: from.toISOString().slice(0, range === "month" ? 10 : 7),
      revenue: fromMinor(bucket.revenue),
      expenses: fromMinor(bucket.expenses),
    };
  });
  const change = (value: number, before: number): number | null =>
    before === 0
      ? value === 0
        ? 0
        : null
      : Math.round(((value - before) / Math.abs(before)) * 10000) / 100;
  return {
    timeRange: range,
    from: start.toISOString(),
    toExclusive: end.toISOString(),
    totals: {
      revenue: fromMinor(current.revenue),
      expenses: fromMinor(current.expenses),
      profit: fromMinor(current.profit),
    },
    previous: {
      revenue: fromMinor(previous.revenue),
      expenses: fromMinor(previous.expenses),
      profit: fromMinor(previous.profit),
    },
    change: {
      revenue: change(current.revenue, previous.revenue),
      expenses: change(current.expenses, previous.expenses),
      profit: change(current.profit, previous.profit),
    },
    chart,
  };
}
