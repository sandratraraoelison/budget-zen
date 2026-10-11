"use client";
import { useLocale } from "@/features/settings/LocaleProvider";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
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
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/60">
      <span className="mb-3 rounded-xl bg-white p-3 text-teal-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-teal-300 dark:ring-slate-700">
        <Sparkles size={20} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t(title)}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-300">
        {t(description)}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
