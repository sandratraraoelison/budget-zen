"use client";
import { useLocale } from "@/features/settings/LocaleProvider";
export default function SyncStatus({
  loading,
  pending,
  error,
}: {
  loading: boolean;
  pending: boolean;
  error: string;
}) {
  const { language } = useLocale();
  if (error)
    return (
      <p
        role="alert"
        className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        {error}
      </p>
    );
  if (!loading && !pending) return null;
  return (
    <p
      role="status"
      className="mb-4 text-sm text-slate-500 dark:text-slate-300"
    >
      {language === "fr"
        ? pending
          ? "Enregistrement en cours..."
          : "Chargement des donn\u00e9es..."
        : pending
          ? "Saving..."
          : "Loading data..."}
    </p>
  );
}
