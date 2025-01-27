"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/types/project";
import Navigation from "@/components/Navigation";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Chargement depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("projects");
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  // Sauvegarde dans localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

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
    setProjects((prev) => [
      ...prev,
      {
        ...newProject,
        id: Math.random().toString(),
        currentFund: newProject.initialFund,
        expenses: [],
        status: "en-cours",
        startDate: newProject.startDate || undefined,
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
