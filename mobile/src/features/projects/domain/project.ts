export type ProjectInput = {
  name: string;
  initialFund: number;
  startDate?: string;
};
export interface Project {
  id: string;
  name: string;
  initialFund: number;
  currentFund: number;
  status: "en-cours" | "achevée";
}
export interface ProjectRepository {
  create(input: ProjectInput): Promise<unknown>;
  list(signal?: AbortSignal): Promise<Project[]>;
}
