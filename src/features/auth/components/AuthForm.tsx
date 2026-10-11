"use client";
import HydratedIcon from "@/components/ui/HydratedIcon";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import type { AuthMode } from "../types";

export default function AuthForm({ initialMode = "register" }: { initialMode?: AuthMode }) {
  const { t } = useLocale();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const { authenticate } = useAuth();
  const router = useRouter();
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (registering && password !== data.get("confirmation")) {
      setError(t("Les mots de passe ne correspondent pas."));
      return;
    }
    setPending(true);
    try {
      await authenticate(mode, {
        email: String(data.get("email") ?? "").trim(), password,
        ...(registering ? { name: String(data.get("name") ?? "").trim() } : {}),
      });
      setRedirecting(true);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setRedirecting(false);
      setPending(false);
      setError(error instanceof Error ? error.message : t("Une erreur est survenue. Veuillez réessayer."));
    }
  }

  function changeMode(next: AuthMode) {
    setMode(next);
    setError("");
    setShowPassword(false);
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:disabled:bg-slate-950";

  return (
    <section id="compte" aria-labelledby="auth-heading" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.25)] sm:p-8 dark:border-slate-700 dark:bg-slate-900">
      {redirecting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <HydratedIcon icon={LoaderCircle} size={32} className="mb-4 animate-spin text-teal-700 dark:text-teal-300" aria-hidden="true" />
            <p className="font-semibold text-slate-900 dark:text-slate-100">{t("Ouverture de votre tableau de bord…")}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{t("Votre espace sera prêt dans un instant.")}</p>
          </div>
        </div>
      )}
      <div className="mb-7 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" aria-label={t("Choisir une action")}>
        {([ ["register", t("Inscription")], ["login", t("Connexion")] ] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={mode === value} disabled={pending} onClick={() => changeMode(value)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${mode === value ? "bg-white text-teal-800 shadow-sm dark:bg-slate-900 dark:text-teal-300" : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"}`}>
            {t(label)}
          </button>
        ))}
      </div>
      <h2 id="auth-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{registering ? t("Votre nouveau départ.") : t("Heureux de vous revoir.")}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{registering ? t("Créez votre compte et prenez vos finances en main.") : t("Connectez-vous pour accéder à votre espace BudgetZen.")}</p>
      <form key={mode} onSubmit={submit} className="mt-6 space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4">
          {registering && <div>
            <label htmlFor="auth-name" className="text-sm font-medium text-slate-700 dark:text-slate-100">{t("Votre nom")}</label>
            <input id="auth-name" name="name" autoComplete="name" placeholder="Alex" required maxLength={100} className={inputClass} />
          </div>}
          <div>
            <label htmlFor="auth-email" className="text-sm font-medium text-slate-700 dark:text-slate-100">{t("Adresse email")}</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required maxLength={254} className={inputClass} />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-sm font-medium text-slate-700 dark:text-slate-100">{t("Mot de passe")}</label>
            <div className="relative">
              <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"}
                required minLength={12} maxLength={128} aria-describedby={registering ? "password-help" : undefined} placeholder={t("Votre mot de passe")} className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t("Masquer le mot de passe") : t("Afficher le mot de passe")}
                className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 dark:text-slate-400 dark:hover:text-teal-300">
                {showPassword ? <HydratedIcon icon={EyeOff} size={18} aria-hidden="true" /> : <HydratedIcon icon={Eye} size={18} aria-hidden="true" />}
              </button>
            </div>
            {registering && <p id="password-help" className="mt-2 text-xs text-slate-500 dark:text-slate-300">{t("12 caractères minimum.")}</p>}
          </div>
          {registering && <div>
            <label htmlFor="auth-confirmation" className="text-sm font-medium text-slate-700 dark:text-slate-100">{t("Confirmer le mot de passe")}</label>
            <input id="auth-confirmation" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} placeholder={t("Répétez votre mot de passe")} className={inputClass} />
          </div>}
        </fieldset>
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">{t(error)}</p>}
        <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-70">
          {pending ? <><HydratedIcon icon={LoaderCircle} size={18} className="animate-spin" aria-hidden="true" />{redirecting ? t("Ouverture de votre tableau de bord…") : registering ? t("Inscription en cours…") : t("Connexion en cours…")}</> : <>{registering ? t("Créer mon compte") : t("Se connecter")}<HydratedIcon icon={ArrowRight} size={18} aria-hidden="true" /></>}
        </button>
        <p className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-300"><HydratedIcon icon={LockKeyhole} size={13} aria-hidden="true" />{t("Votre espace personnel, en toute simplicité.")}</p>
      </form>
    </section>
  );
}
