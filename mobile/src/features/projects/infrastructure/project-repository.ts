import type { HttpClient } from "../../../shared/api/client";
import type { Project, ProjectRepository } from "../domain/project";
export const createProjectRepository = (
  http: HttpClient,
): ProjectRepository => ({
  list: (signal) => http.request<Project[]>("projects", { signal }),
});
