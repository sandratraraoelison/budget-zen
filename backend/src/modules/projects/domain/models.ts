import type { FundingJournal } from "../../../shared/domain/funding";
export interface Expense {
  id: string;
  description: string;
  amountMinor: number;
  date: string;
  category: string;
}
export interface Project {
  id: string;
  name: string;
  initialFundMinor: number;
  savedFundMinor?: number;
  status: "en-cours" | "achevée";
  expenses: Expense[];
  startDate?: string;
  targetDate?: string | null;
}
export interface ProjectInput {
  name: string;
  initialFund: number;
  savedFund?: number;
  startDate?: string;
  targetDate?: string | null;
}
export interface UpdateProjectInput extends Partial<ProjectInput> {
  status?: Project["status"];
}
export interface ExpenseInput {
  description: string;
  amount: number;
  date: string;
  category: string;
}
export interface ProjectsState extends FundingJournal {
  spentDeletedProjectsMinor?: number;
  projects: Project[];
}
export const emptyProjectsState = (): ProjectsState => ({ projects: [] });
