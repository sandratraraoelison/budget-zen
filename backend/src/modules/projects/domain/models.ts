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
  status: "en-cours" | "achevée";
  expenses: Expense[];
  startDate?: string;
}
export interface ProjectInput {
  name: string;
  initialFund: number;
  startDate?: string;
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
export interface ProjectsState {
  projects: Project[];
}
export const emptyProjectsState = (): ProjectsState => ({ projects: [] });
