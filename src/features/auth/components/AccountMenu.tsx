"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Déconnexion impossible.");
    } finally { setPending(false); }
  }

  return <div className="relative flex shrink-0 items-center gap-3">
    <span className="hidden max-w-32 truncate text-sm text-slate-500 sm:block" title={user?.name}>{user?.name}</span>
    <button type="button" onClick={signOut} disabled={pending} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-60">
      {pending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}Déconnexion
    </button>
    {error && <p role="alert" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}
