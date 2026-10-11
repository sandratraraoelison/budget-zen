"use client";
import { useLocale } from "@/features/settings/LocaleProvider";
export default function OtherCategoryName({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
  id: string;
}) {
  const { t } = useLocale();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {t("Nom de catégorie (optionnel)")}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        maxLength={100}
        placeholder={t("Ex. : Voyage, Animaux…")}
        className="w-full rounded-lg border p-2"
      />
      <p className="text-xs text-slate-500 dark:text-slate-300">
        {t(
          "Laissez vide pour utiliser Autres. Sinon, la catégorie sera créée ou réutilisée.",
        )}
      </p>
    </div>
  );
}
