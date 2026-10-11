"use client";

import { ArrowRight, CalendarDays, RotateCcw } from "lucide-react";
import DateInput from "@/components/ui/DateInput";
import { useLocale } from "@/features/settings/LocaleProvider";
import type { BusinessAnalytics, TimeRange } from "../types";

export function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function BusinessPeriodFilters({
  timeRange,
  onTimeRangeChange,
  anchor,
  onAnchorChange,
  analytics,
}: {
  timeRange: TimeRange;
  onTimeRangeChange(value: TimeRange): void;
  anchor: string;
  onAnchorChange(value: string): void;
  analytics: BusinessAnalytics | null;
}) {
  const { t, locale } = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const inputClass = "block h-11 w-full border px-3 py-2";
  return (
    <section
      className="ui-card mb-6"
      aria-label={t("Période des statistiques")}
    >
      <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[180px_220px_auto_minmax(0,1fr)]">
        <div className="min-w-0 space-y-2">
          <label htmlFor="business-time-range" className="block">
            {t("Période des statistiques")}
          </label>
          <select
            id="business-time-range"
            className={inputClass}
            value={timeRange}
            onChange={(event) =>
              onTimeRangeChange(event.target.value as TimeRange)
            }
          >
            <option value="month">{t("Mensuel")}</option>
            <option value="quarter">{t("Trimestriel")}</option>
            <option value="year">{t("Annuel")}</option>
          </select>
        </div>
        <div className="min-w-0 space-y-2">
          <label htmlFor="business-period-date" className="block">
            {t("Date dans la période")}
          </label>
          <DateInput
            id="business-period-date"
            required
            value={anchor}
            className={inputClass}
            onChange={(event) => {
              if (event.target.value) onAnchorChange(event.target.value);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => onAnchorChange(localToday())}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 dark:border-slate-700 dark:text-teal-300 dark:hover:bg-slate-800"
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t("Aujourd’hui")}
        </button>
        <div
          className="flex min-h-11 min-w-0 flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
          role="status"
          aria-live="polite"
        >
          <CalendarDays size={17} className="shrink-0" aria-hidden="true" />
          {analytics ? (
            <>
              <time dateTime={analytics.from.slice(0, 10)}>
                {formatter.format(new Date(analytics.from))}
              </time>
              <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
              <time
                dateTime={new Date(Date.parse(analytics.toExclusive) - 86400000)
                  .toISOString()
                  .slice(0, 10)}
              >
                {formatter.format(
                  new Date(Date.parse(analytics.toExclusive) - 86400000),
                )}
              </time>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </section>
  );
}
