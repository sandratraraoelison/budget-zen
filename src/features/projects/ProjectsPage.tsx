"use client";

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
import Navigation from "@/components/Navigation";
import { reconcileProject } from "./domain/project";

export default function ProjectsPage() {
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
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto p-6">
        {error && (
          <p role="alert" className="mb-4 text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Projets</h1>
          <button
            disabled={!!error}
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-6 h-6 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="tous">Tous les projets</option>
              <option value="en-cours">En cours</option>
              <option value="achevée">Achevés</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-gray-600" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            />
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white w-full"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

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
      </div>
    </div>
  );
}
