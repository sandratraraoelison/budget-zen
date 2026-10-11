"use client";
import { useLocale } from "@/features/settings/LocaleProvider";
export default function PageLoading() {
  const { language } = useLocale();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700"
      />
      {language === "fr" ? "Chargement de la page…" : "Loading page…"}
    </div>
  );
}
