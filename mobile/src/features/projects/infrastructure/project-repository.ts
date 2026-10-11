import type { HttpClient } from "../../../shared/api/client";
import type { Project, ProjectRepository } from "../domain/project";
export const createProjectRepository = (
  http: HttpClient,
): ProjectRepository => ({
  update: (id, body) =>
    http.request(`projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  contribute: (id, amount, direction) =>
    http.request(`projects/${id}/contributions`, {
      method: "POST",
      body: { amount, direction },
    }),
  create: (body) => http.request("projects", { method: "POST", body }),
  list: (signal) => http.request<Project[]>("projects", { signal }),
});
