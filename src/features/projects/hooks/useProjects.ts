"use client";
import { accountRequest } from "@/shared/api/client";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { importLegacyProjects } from "./importLegacyProjects";
import type { Project } from "../types";
import { useAccountCollection } from "@/shared/application/useAccountCollection";
import type { CollectionConfig } from "@/shared/api/collections";
const config: CollectionConfig<Project> = {
  path: "projects",
  body: (p) => ({
    ...(p.savedFund !== undefined ? { savedFund: p.savedFund } : {}),
    name: p.name,
    initialFund: p.initialFund,
    ...(p.targetDate !== undefined ? { targetDate: p.targetDate } : {}),
    ...(p.startDate ? { startDate: p.startDate } : {}),
    status: p.status,
  }),
  createBody: (p) => ({
    savedFund: p.savedFund ?? 0,
    name: p.name,
    initialFund: p.initialFund,
    ...(p.targetDate !== undefined ? { targetDate: p.targetDate } : {}),
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
    contributeProject: (
      id: string,
      amount: number,
      direction: "add" | "withdraw",
    ) =>
      resource.mutate(() =>
        accountRequest(`projects/${id}/contributions`, {
          method: "POST",
          body: JSON.stringify({ amount, direction }),
        }),
      ),
    setProjects: resource.setItems,
    importLocalProjects: () =>
      resource.mutate(async () => {
        if (user) await importLegacyProjects(user.id);
      }),
  };
}
