export interface Project {
  id: string;
  name: string;
  initialFund: number;
  currentFund: number;
  status: "en-cours" | "achevée";
}
export interface ProjectRepository {
  list(signal?: AbortSignal): Promise<Project[]>;
}
