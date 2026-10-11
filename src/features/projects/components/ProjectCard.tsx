"use client";
import FundingHistory from "@/features/budget/components/FundingHistory";
import { projectTimeline } from "../domain/timeline";
import DateInput from "@/components/ui/DateInput";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ExpenseList from "./ExpenseList";
import { Project } from "@/features/projects/types";
import { projectProgress, reconcileProject } from "../domain/project";

type ProjectCardProps = {
  project: Project;
  setProjects: (update: React.SetStateAction<Project[]>) => Promise<void>;
  onDelete: (projectId: string) => void;
  contribute(
    id: string,
    amount: number,
    direction: "add" | "withdraw",
  ): Promise<void>;
};

export default function ProjectCard({
  project,
  setProjects,
  onDelete,
  contribute,
}: ProjectCardProps) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [savedFund, setSavedFund] = useState(
    String(project.savedFund ?? project.initialFund),
  );
  const [fund, setFund] = useState(project.initialFund.toString());
  const [name, setName] = useState(project.name);
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [targetDate, setTargetDate] = useState(project.targetDate ?? "");
  const [movement, setMovement] = useState<"add" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const timeline = projectTimeline(
    project,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
  );
  const [error, setError] = useState("");

  const saveMovement = async () => {
    if (pending || !movement) return;
    setPending(true);
    setError("");
    try {
      await contribute(project.id, Number(amount), movement);
      setMovement(null);
      setAmount("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  };
  const updateFund = async () => {
    if (pending) return;
    setPending(true);
    try {
      if (!fund.trim()) throw new Error(t("Saisissez le budget du projet."));
      const updated = reconcileProject({
        ...project,
        initialFund: Number(fund),
        savedFund: Number(savedFund),
        name,
        startDate: startDate || undefined,
        targetDate: targetDate || null,
      });
      await setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updated : p)),
      );
      setIsEditing(false);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  };

  const updateStatus = (newStatus: "en-cours" | "achevée") => {
    void setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)),
    ).catch(() => {});
  };

  return (
    <div className="ui-card">
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-300">
          {t(error)}
        </p>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onDelete(project.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-300"
              title={t("Supprimer le projet")}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                project.status === "achevée"
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              {t(timeline.phase === "planned" ? "À venir" : project.status)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFund(String(project.initialFund));
              setSavedFund(String(project.savedFund ?? project.initialFund));
              setName(project.name);
              setStartDate(project.startDate ?? "");
              setTargetDate(project.targetDate ?? "");
              setIsEditing(!isEditing);
            }}
            title={t("Modifier le projet")}
            aria-label={t("Modifier le projet")}
            className="text-gray-500 hover:text-primary dark:text-slate-300"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
        {project.startDate && (
          <p>
            {t("Date de commencement")} :{" "}
            {new Date(`${project.startDate}T12:00:00`).toLocaleDateString(
              locale,
            )}
          </p>
        )}
        {project.targetDate && (
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {t("Date cible")} :{" "}
            {new Date(`${project.targetDate}T12:00:00`).toLocaleDateString(
              locale,
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </p>
        )}
        {project.status === "en-cours" && timeline.targetDays !== undefined && (
          <p
            className={
              timeline.targetDays < 0
                ? "font-medium text-red-600 dark:text-red-300"
                : "font-medium text-teal-600 dark:text-teal-300"
            }
          >
            {timeline.targetDays < 0
              ? t("Date cible dépassée")
              : timeline.targetDays === 0
                ? t("C’est aujourd’hui")
                : t("{days} jours restants", { days: timeline.targetDays })}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 dark:bg-slate-800">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${projectProgress(project)}%`,
            }}
          />
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span>
            {t("Mis de côté")} :{" "}
            {formatMoney(project.savedFund ?? project.initialFund)}
          </span>
          <span>
            {t("Objectif")} : {formatMoney(project.initialFund)}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-300">
          {(project.savedFund ?? project.initialFund) >= project.initialFund &&
          project.initialFund > 0
            ? t("Objectif financé")
            : `${t("Reste à épargner")} : ${formatMoney(Math.max(0, (Math.round(project.initialFund * 100) - Math.round((project.savedFund ?? project.initialFund) * 100)) / 100))}`}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t("Disponible dans la cagnotte")} :{" "}
          {formatMoney(project.currentFund)}
        </p>
      </div>
      {project.status === "en-cours" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className="ui-primary"
            disabled={pending}
            onClick={() => {
              setMovement("add");
              setAmount("");
            }}
          >
            {t("Mettre de côté")}
          </button>
          <button
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            disabled={pending || project.currentFund <= 0}
            onClick={() => {
              setMovement("withdraw");
              setAmount("");
            }}
          >
            {t("Retirer")}
          </button>
        </div>
      )}
      {movement && (
        <div className="mb-4 space-y-2 rounded-xl border p-3 dark:border-slate-700">
          <label className="block">
            {t(movement === "add" ? "Mettre de côté" : "Retirer")}
            <AmountInput
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <button
            className="ui-primary"
            disabled={pending}
            onClick={() => void saveMovement()}
          >
            {t("Enregistrer")}
          </button>
          <button
            className="ml-2"
            disabled={pending}
            onClick={() => setMovement(null)}
          >
            {t("Annuler")}
          </button>
        </div>
      )}

      {isEditing && (
        <div className="mb-4 grid gap-3 rounded-xl border p-3 dark:border-slate-700">
          <label>
            {t("Déjà mis de côté")}
            <AmountInput
              value={savedFund}
              onChange={(event) => setSavedFund(event.target.value)}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <label>
            {t("Nom du projet *")}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <label>
            {t("Montant cible (")}
            <AmountInput
              type="number"
              min="0"
              step="0.01"
              value={fund}
              onChange={(event) => setFund(event.target.value)}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <label>
            {t("Date de commencement")}
            <DateInput
              value={startDate}
              max={targetDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <label>
            {t("Date cible du projet (optionnel)")}
            <DateInput
              value={targetDate}
              min={startDate || undefined}
              onChange={(event) => setTargetDate(event.target.value)}
              disabled={pending}
              className="w-full rounded border p-2"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => void updateFund()}
              disabled={pending}
              className="ui-primary"
            >
              {t("Enregistrer")}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={pending}
              className="px-3 py-2"
            >
              {t("Annuler")}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() =>
            updateStatus(project.status === "en-cours" ? "achevée" : "en-cours")
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {t(
            project.status === "en-cours"
              ? "Marquer comme achevé"
              : "Remettre en cours",
          )}
        </button>
      </div>

      <ExpenseList project={project} setProjects={setProjects} />
      <FundingHistory entries={project.history ?? []} />
    </div>
  );
}
