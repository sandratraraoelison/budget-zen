"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import type { AuthMode } from "../types";

export default function AuthForm({ initialMode = "register" }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
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
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      await authenticate(mode, {
        email: String(data.get("email") ?? "").trim(), password,
        ...(registering ? { name: String(data.get("name") ?? "").trim() } : {}),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally { setPending(false); }
  }

  function changeMode(next: AuthMode) {
    setMode(next);
    setError("");
    setShowPassword(false);
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50";

  return (
    <section id="compte" aria-labelledby="auth-heading" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.25)] sm:p-8">
      <div className="mb-7 flex rounded-xl bg-slate-100 p-1" aria-label="Choisir une action">
        {([ ["register", "Inscription"], ["login", "Connexion"] ] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={mode === value} disabled={pending} onClick={() => changeMode(value)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${mode === value ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
            {label}
          </button>
        ))}
      </div>
      <h2 id="auth-heading" className="text-2xl font-bold tracking-tight text-slate-900">{registering ? "Votre nouveau départ." : "Heureux de vous revoir."}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{registering ? "Créez votre compte et prenez vos finances en main." : "Connectez-vous pour accéder à votre espace BudgetZen."}</p>
      <form key={mode} onSubmit={submit} className="mt-6 space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4">
          {registering && <div>
            <label htmlFor="auth-name" className="text-sm font-medium text-slate-700">Votre nom</label>
            <input id="auth-name" name="name" autoComplete="name" placeholder="Alex" required maxLength={100} className={inputClass} />
          </div>}
          <div>
            <label htmlFor="auth-email" className="text-sm font-medium text-slate-700">Adresse email</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required maxLength={254} className={inputClass} />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">Mot de passe</label>
            <div className="relative">
              <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"}
                required minLength={12} maxLength={128} aria-describedby={registering ? "password-help" : undefined} placeholder="Votre mot de passe" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {registering && <p id="password-help" className="mt-2 text-xs text-slate-500">12 caractères minimum.</p>}
          </div>
          {registering && <div>
            <label htmlFor="auth-confirmation" className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
            <input id="auth-confirmation" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} placeholder="Répétez votre mot de passe" className={inputClass} />
          </div>}
        </fieldset>
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
        <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-70">
          {pending ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />Connexion en cours…</> : <>{registering ? "Créer mon compte" : "Se connecter"}<ArrowRight size={18} aria-hidden="true" /></>}
        </button>
        <p className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500"><LockKeyhole size={13} aria-hidden="true" />Votre espace personnel, en toute simplicité.</p>
      </form>
    </section>
  );
}
