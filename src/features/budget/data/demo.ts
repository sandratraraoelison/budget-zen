import type { AppState } from "../types";

export const createDemoState = (): AppState => ({
  transactions: [
    {
      id: "1",
      amount: 1200,
      date: new Date("2024-03-01"),
      description: "Loyer mars",
      category: "loyer",
      type: "expense",
    },
    {
      id: "2",
      amount: 2500,
      date: new Date("2024-03-05"),
      description: "Salaire",
      category: "salaire",
      type: "income",
    },
  ],
  budgets: [
    {
      id: "1",
      category: "nourriture",
      limit: 500,
      current: 450,
    },
    {
      id: "2",
      category: "transport",
      limit: 200,
      current: 0,
    },
  ],
  savingsGoals: [
    {
      id: "1",
      name: "Vacances d'été",
      target: 3000,
      current: 1200,
      deadline: new Date("2024-06-01"),
    },
  ],
  alerts: [],
  customCategories: [],
});

