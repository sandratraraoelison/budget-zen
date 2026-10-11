"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { Project } from "../types";

const projectsSchema = z.array(z.object({
  id: z.string(), name: z.string(), initialFund: z.number(), currentFund: z.number(),
  status: z.enum(["en-cours", "achevée"]), startDate: z.string().optional(),
  expenses: z.array(z.object({ id: z.string(), description: z.string(), amount: z.number(),
    date: z.string(), category: z.string() })),
}));

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("projects");
      if (saved) {
        const result = projectsSchema.safeParse(JSON.parse(saved));
        if (result.success) setProjects(result.data);
      }
    } catch (error) {
      console.warn("Impossible de charger les projets sauvegardés.", error);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("projects", JSON.stringify(projects)); }
    catch (error) { console.warn("Impossible de sauvegarder les projets.", error); }
  }, [loaded, projects]);

  return { projects, setProjects };
}
