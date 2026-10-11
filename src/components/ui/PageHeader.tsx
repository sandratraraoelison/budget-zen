"use client";
import { useLocale } from "@/features/settings/LocaleProvider";
import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{t("Votre espace BudgetZen")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {t(title)}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-300">
          {t(description)}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
