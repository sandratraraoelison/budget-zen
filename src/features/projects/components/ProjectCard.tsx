"use client";
import AmountInput from "@/components/ui/AmountInput";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useCurrency } from "@/features/settings/CurrencyProvider";

import { useState } from "react";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import ExpenseList from "./ExpenseList";
import { Project } from "@/features/projects/types";
import { projectProgress, reconcileProject } from "../domain/project";

type ProjectCardProps = {
  project: Project;
  setProjects: (update: React.SetStateAction<Project[]>) => Promise<void>;
  onDelete: (projectId: string) => void;
};

export default function ProjectCard({
  project,
  setProjects,
  onDelete,
}: ProjectCardProps) {
  const { t, locale } = useLocale();
  const { formatMoney } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [fund, setFund] = useState(project.initialFund.toString());
  const [error, setError] = useState("");

  const updateFund = async () => {
    try {
      if (!fund.trim()) throw new Error(t("Saisissez le budget du projet."));
      const updated = reconcileProject({
        ...project,
        initialFund: Number(fund),
      });
      await setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updated : p)),
      );
      setIsEditing(false);
      setError("");
    } catch (error) {
      setError((error as Error).message);
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
              {t(project.status)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-primary dark:text-slate-300"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {project.startDate && (
        <div className="mb-2 text-sm text-gray-500 dark:text-slate-300">{t("Commencé le :")}{new Date(project.startDate).toLocaleDateString(locale)}
        </div>
      )}

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 dark:bg-slate-800">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${projectProgress(project)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
          <span>{t("Utilisé :")}{formatMoney(project.initialFund - project.currentFund)}
          </span>
          <span>{t("Restant :")}{formatMoney(project.currentFund)}</span>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 mb-4">
          <AmountInput
            type="number"
            min="0"
            step="0.01"
            value={fund}
            onChange={(e) => setFund(e.target.value)}
            className="p-2 border rounded w-32"
          />
          <button
            onClick={updateFund}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            <CheckIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => updateStatus("achevée")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
        >{t("Marquer comme achevé")}</button>
        <button
          onClick={() => updateStatus("en-cours")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
        >{t("Remettre en cours")}</button>
      </div>

      <ExpenseList project={project} setProjects={setProjects} />
    </div>
  );
}
