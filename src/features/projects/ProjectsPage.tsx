"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import NewProjectModal from "@/features/projects/components/NewProjectModal";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { useProjects } from "./hooks/useProjects";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Navigation from "@/components/Navigation";
import { reconcileProject } from "./domain/project";

export default function ProjectsPage() {
  const { t } = useLocale();
  const { projects, setProjects, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "tous" ? true : project.status === statusFilter;
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter ? project.startDate === dateFilter : true;

    return matchesStatus && matchesSearch && matchesDate;
  });

  const addProject = (newProject: {
    name: string;
    initialFund: number;
    startDate?: string;
  }) => {
    const project = reconcileProject({
      ...newProject,
      id: crypto.randomUUID(),
      currentFund: newProject.initialFund,
      expenses: [],
      status: "en-cours",
    });
    setProjects((prev) => [...prev, project]);
  };

  const deleteProject = (projectId: string) => {
    if (!window.confirm(t("Supprimer ce projet et ses dépenses ?"))) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="workspace">
      <Navigation />
      <main id="main-content" className="workspace-main" tabIndex={-1}>
        {error && (
          <p role="alert" className="mb-4 text-red-600 dark:text-red-300">
            {t(error)}
          </p>
        )}
        <PageHeader
          title={t("Projets")}
          description={t("Faites avancer vos projets en gardant la maîtrise des dépenses.")}
          action={
            <button
              disabled={!!error}
              onClick={() => setIsModalOpen(true)}
              className="ui-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />{t("Nouveau Projet")}</button>
          }
        />

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
            <select
              aria-label={t("Filtrer les projets par statut")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="tous">{t("Tous les projets")}</option>
              <option value="en-cours">{t("En cours")}</option>
              <option value="achevée">{t("Achevés")}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
            <input
              aria-label={t("Filtrer par date de démarrage")}
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border rounded-lg bg-white dark:bg-slate-900"
            />
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              aria-label={t("Rechercher un projet")}
              type="text"
              placeholder={t("Rechercher un projet...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white w-full dark:bg-slate-900"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 dark:text-slate-400" />
          </div>
        </div>

        {filteredProjects.length === 0 && !error && (
          <EmptyState
            title={
              projects.length
                ? t("Aucun projet trouvé")
                : t("Une idée, un premier projet")
            }
            description={
              projects.length
                ? t("Modifiez les filtres pour retrouver vos projets.")
                : t("Créez un projet et définissez son budget pour commencer.")
            }
            action={
              <button
                onClick={() => {
                  if (!projects.length) {
                    setIsModalOpen(true);
                    return;
                  }
                  setSearchQuery("");
                  setStatusFilter("tous");
                  setDateFilter("");
                }}
                className="ui-primary"
              >
                {projects.length
                  ? t("Réinitialiser les filtres")
                  : t("Créer un projet")}
              </button>
            }
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              setProjects={setProjects}
              onDelete={deleteProject}
            />
          ))}
        </div>

        <NewProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addProject}
        />
      </main>
    </div>
  );
}
