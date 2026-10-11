"use client";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { importLegacyProjects } from "./importLegacyProjects";
import type { Project } from "../types";
import { useAccountCollection } from "@/shared/application/useAccountCollection";
import type { CollectionConfig } from "@/shared/api/collections";
const config: CollectionConfig<Project> = {
  path: "projects",
  body: (p) => ({
    name: p.name,
    initialFund: p.initialFund,
    ...(p.startDate ? { startDate: p.startDate } : {}),
    status: p.status,
  }),
  createBody: (p) => ({
    name: p.name,
    initialFund: p.initialFund,
    ...(p.startDate ? { startDate: p.startDate } : {}),
  }),
  children: {
    path: "expenses",
    items: (p) => p.expenses,
    body: (e) => ({
      description: e.description,
      amount: e.amount,
      date: e.date,
      category: e.category,
    }),
  },
};
export function useProjects() {
  const { user } = useAuth();
  const resource = useAccountCollection(config);
  return {
    ...resource,
    projects: resource.items,
    setProjects: resource.setItems,
    importLocalProjects: () =>
      resource.mutate(async () => {
        if (user) await importLegacyProjects(user.id);
      }),
  };
}
