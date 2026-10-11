import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, CircleCheck, FolderOpen, Leaf, Wallet } from "lucide-react";
import AuthForm from "./components/AuthForm";
import type { AuthMode } from "./types";

const features = [
  { icon: Wallet, title: "Un budget plus clair", description: "Suivez vos revenus et dépenses pour comprendre où va votre argent." },
  { icon: FolderOpen, title: "Des projets qui avancent", description: "Organisez vos projets et gardez vos objectifs en vue." },
  { icon: ChartNoAxesCombined, title: "Une vue d’ensemble", description: "Retrouvez vos budgets, crédits et activités dans un même espace." },
];

export default function LandingPage({ initialMode = "register" }: { initialMode?: AuthMode }) {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" aria-label="BudgetZen, accueil" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white"><Leaf size={22} aria-hidden="true" /></span>Budget<span className="-ml-2 text-teal-700">Zen</span>
        </Link>
        <Link href="/auth/login" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-teal-300 hover:text-teal-800 sm:px-5">Se connecter <ArrowUpRight size={14} className="ml-1 inline" aria-hidden="true" /></Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12 pt-5 sm:px-10 sm:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <section aria-labelledby="landing-heading" className="py-2 lg:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Moins de stress. Plus de clarté.</div>
            <h1 id="landing-heading" className="mt-6 text-4xl font-bold leading-[1.12] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Votre argent,<br />l’esprit <span className="text-teal-700">tranquille.</span></h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">Un espace simple pour organiser votre budget, suivre vos projets et avancer à votre rythme.</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2"><CircleCheck size={17} className="text-teal-600" aria-hidden="true" />Simple à prendre en main</span>
              <span className="flex items-center gap-2"><CircleCheck size={17} className="text-teal-600" aria-hidden="true" />Tout au même endroit</span>
            </div>
            <div className="mt-10 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-white p-2.5 text-teal-700 shadow-sm"><Leaf size={21} aria-hidden="true" /></span>
                <div><p className="font-semibold text-teal-900">Un petit pas pour votre budget.</p><p className="mt-1 text-sm leading-6 text-teal-800/70">Commencez par une vision claire de vos finances. Le reste, à votre rythme.</p></div>
              </div>
            </div>
          </section>
          <AuthForm initialMode={initialMode} />
        </div>

        <section aria-label="Les fonctionnalités de BudgetZen" className="mt-14 grid gap-6 border-t border-slate-200/80 pt-8 sm:grid-cols-3 lg:mt-16">
          {features.map(({ icon: Icon, title, description }) => <article key={title} className="flex gap-3 sm:block">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 ring-1 ring-slate-200/80"><Icon size={20} aria-hidden="true" /></span>
            <div><h2 className="font-semibold sm:mt-3">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{description}</p></div>
          </article>)}
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-6 pb-6 text-xs text-slate-400 sm:px-10">BudgetZen · Un quotidien financier plus serein.</footer>
    </div>
  );
}
