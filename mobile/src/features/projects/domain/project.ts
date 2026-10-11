import type { FundingEntry } from "../../budget/domain/budget";
export type ProjectInput = {
  name: string;
  initialFund: number;
  savedFund?: number;
  startDate?: string;
  targetDate?: string | null;
};
export interface Project {
  history?: FundingEntry[];
  id: string;
  name: string;
  initialFund: number;
  savedFund?: number;
  currentFund: number;
  startDate?: string;
  targetDate?: string | null;
  status: "en-cours" | "achevée";
}
export interface ProjectRepository {
  contribute(
    id: string,
    amount: number,
    direction: "add" | "withdraw",
  ): Promise<unknown>;
  update(
    id: string,
    input: Partial<ProjectInput> & { status?: Project["status"] },
  ): Promise<unknown>;
  create(input: ProjectInput): Promise<unknown>;
  list(signal?: AbortSignal): Promise<Project[]>;
}
