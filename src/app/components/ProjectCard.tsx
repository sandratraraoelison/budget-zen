"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import ExpenseList from "./ExpenseList";
import { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onDelete: (projectId: string) => void;
};

export default function ProjectCard({
  project,
  setProjects,
  onDelete,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fund, setFund] = useState(project.initialFund.toString());

  const updateFund = () => {
    const newFund = parseFloat(fund);
    if (!isNaN(newFund) && newFund >= 0) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                initialFund: newFund,
                currentFund: p.currentFund + (newFund - p.initialFund),
              }
            : p
        )
      );
      setIsEditing(false);
    }
  };

  const updateStatus = (newStatus: "en-cours" | "achevée") => {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onDelete(project.id)}
              className="text-red-500 hover:text-red-700"
              title="Supprimer le projet"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                project.status === "achevée"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-primary"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
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
      ) : (
        <div className="mb-4">
          <p className="text-gray-600">
            Budget initial : {project.initialFund.toFixed(2)}MGA
          </p>
          <p
            className={`text-lg font-semibold ${
              project.currentFund < 0 ? "text-red-600" : "text-gray-800"
            }`}
          >
            Solde actuel : {project.currentFund.toFixed(2)}MGA
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => updateStatus("achevée")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
        >
          Marquer comme achevé
        </button>
        <button
          onClick={() => updateStatus("en-cours")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
        >
          Remettre en cours
        </button>
      </div>

      <ExpenseList project={project} setProjects={setProjects} />
    </div>
  );
}
