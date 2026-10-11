"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { Project } from "../types";
import { useAuth } from "@/features/auth/context/AuthProvider";

const projectsSchema = z.array(z.object({
  id: z.string(), name: z.string(), initialFund: z.number(), currentFund: z.number(),
  status: z.enum(["en-cours", "achevée"]), startDate: z.string().optional(),
  expenses: z.array(z.object({ id: z.string(), description: z.string(), amount: z.number(),
    date: z.string(), category: z.string() })),
}));

export function useProjects() {
  const { user } = useAuth();
  const storageKey = user ? `budgetzen:projects:${user.id}` : null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    setLoadedKey(null);
    setProjects([]);
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const result = projectsSchema.safeParse(JSON.parse(saved));
        if (result.success) setProjects(result.data);
      }
    } catch (error) {
      console.warn("Impossible de charger les projets sauvegardés.", error);
    }
    setLoadedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || loadedKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(projects)); }
    catch (error) { console.warn("Impossible de sauvegarder les projets.", error); }
  }, [loadedKey, storageKey, projects]);

  return { projects, setProjects };
}
