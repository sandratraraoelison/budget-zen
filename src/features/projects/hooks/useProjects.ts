"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { Project } from "../types";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { reconcileProject } from "../domain/project";

const projectsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    initialFund: z.number(),
    currentFund: z.number(),
    status: z.enum(["en-cours", "achevée"]),
    startDate: z.string().optional(),
    expenses: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        amount: z.number(),
        date: z.string(),
        category: z.string(),
      }),
    ),
  }),
);

export function useProjects({ readOnly = false }: { readOnly?: boolean } = {}) {
  const { user } = useAuth();
  const storageKey = user ? `budgetzen:projects:${user.id}` : null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadedKey(null);
    setProjects([]);
    setError("");
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const result = projectsSchema.safeParse(JSON.parse(saved));
        if (!result.success)
          throw new Error("Les projets sauvegardés sont invalides.");
        setProjects(result.data.map(reconcileProject));
      }
    } catch (error) {
      console.warn("Impossible de charger les projets sauvegardés.", error);
      setError(
        "Les projets sauvegardés sont incohérents. La sauvegarde d’origine est conservée.",
      );
      return;
    }
    setLoadedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (readOnly || !storageKey || loadedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(projects));
    } catch (error) {
      console.warn("Impossible de sauvegarder les projets.", error);
      setError("Impossible de sauvegarder les projets dans ce navigateur.");
    }
  }, [loadedKey, storageKey, projects, readOnly]);

  return {
    projects,
    setProjects,
    error,
    loading: !!storageKey && loadedKey !== storageKey && !error,
  };
}
