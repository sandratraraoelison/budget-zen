"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useBudget } from "@/features/budget/context/BudgetProvider";
import CustomCategoryForm from "@/features/budget/components/CustomCategoryForm";
import CustomCategoryDetails from "@/features/budget/components/CustomCategoryDetails";
import { useState } from "react";

export default function ProjectsView() {
  const { t } = useLocale();
  const { state } = useBudget();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">{t("Nouveau Projet")}</h2>
        <CustomCategoryForm />
      </div>

      <div className="bg-white rounded-lg shadow p-6 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">{t("Projets Existants")}</h2>
        <div className="space-y-4">
          {state.customCategories.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-950"
              onClick={() => setSelectedProject(project.id)}
            >
              <h3 className="font-medium">{project.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-slate-800">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${Math.min(
                      (project.spent / project.budget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="mt-6">
            <CustomCategoryDetails categoryId={selectedProject} />
          </div>
        )}
      </div>
    </div>
  );
}
