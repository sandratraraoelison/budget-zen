export type Expense = {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  };
  
  export type Project = {
    id: string;
    name: string;
    initialFund: number;
    currentFund: number;
    status: "en-cours" | "achevée";
    expenses: Expense[];
  };