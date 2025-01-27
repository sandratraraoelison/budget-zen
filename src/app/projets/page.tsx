"use client";

import { useState } from "react";
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/types/project"; // Import ajouté
import Navigation from "@/components/Navigation";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("tous");

  const filteredProjects = projects.filter((project) =>
    statusFilter === "tous" ? true : project.status === statusFilter
  );
  const addProject = (newProject: { name: string; initialFund: number }) => {
    setProjects((prev) => [
      ...prev,
      {
        ...newProject,
        id: Math.random().toString(),
        currentFund: newProject.initialFund,
        expenses: [],
        status: "en-cours",
      },
    ]);
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Projets</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <FunnelIcon className="w-6 h-6 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="tous">Tous les projets</option>
            <option value="en-cours">Projets en cours</option>
            <option value="achevée">Projets achevés</option>
          </select>
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
