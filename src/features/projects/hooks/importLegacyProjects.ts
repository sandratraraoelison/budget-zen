import { z } from "zod";
import { accountRequest } from "@/shared/api/client";
import { reconcileProject } from "../domain/project";
import type { Project } from "../types";
const schema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    initialFund: z.number(),
    currentFund: z.number(),
    status: z.enum(["en-cours", "achev\u00e9e"]),
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
export async function importLegacyProjects(userId: string) {
  const key = `budgetzen:projects:${userId}`;
  const saved = localStorage.getItem(key);
  if (!saved) return;
  const projects = schema.parse(JSON.parse(saved)).map(reconcileProject);
  const markerKey = `${key}:server-import`;
  const markers: Record<string, string> = JSON.parse(
    localStorage.getItem(markerKey) ?? "{}",
  );
  const server = await accountRequest<Project[]>("projects");
  for (const project of projects) {
    if (markers[`done:${project.id}`]) continue;
    let id = markers[project.id];
    if (!id) {
      // Recover an acknowledged server write even if the browser failed to save its marker.
      const matching = server.find(
        (p) =>
          p.name === project.name &&
          p.initialFund === project.initialFund &&
          p.startDate === project.startDate,
      );
      const created =
        matching ??
        (await accountRequest<Project>("projects", {
          method: "POST",
          body: JSON.stringify({
            name: project.name,
            initialFund: project.initialFund,
            ...(project.startDate ? { startDate: project.startDate } : {}),
          }),
        }));
      id = created.id;
      markers[project.id] = id;
      localStorage.setItem(markerKey, JSON.stringify(markers));
    }
    const current = await accountRequest<Project>(`projects/${id}`);
    for (const expense of project.expenses) {
      if (markers[expense.id]) continue;
      const existing = current.expenses.find(
        (e) =>
          !Object.values(markers).includes(e.id) &&
          e.description === expense.description &&
          e.amount === expense.amount &&
          e.date === expense.date &&
          e.category === expense.category,
      );
      const { id: _id, ...body } = expense;
      const result =
        existing ??
        (await accountRequest<Project>(`projects/${id}/expenses`, {
          method: "POST",
          body: JSON.stringify(body),
        }));
      markers[expense.id] =
        "expenses" in result
          ? result.expenses[result.expenses.length - 1].id
          : result.id;
      localStorage.setItem(markerKey, JSON.stringify(markers));
    }
    if (project.status !== current.status)
      await accountRequest(`projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: project.status }),
      });
    markers[`done:${project.id}`] = id;
    localStorage.setItem(markerKey, JSON.stringify(markers));
  }
}
