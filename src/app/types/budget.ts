 export interface SavingsGoal {
    id: string
    name: string
    target: number
    current: number
    deadline: Date
  }
  
  export type TransactionCategory =
  | 'salaire'
  | 'loyer'
  | 'nourriture'
  | 'transport'
  | 'santé'
  | 'loisirs'
  | 'autres'

export interface Transaction {
  id: string
  amount: number
  date: Date
  description: string
  category: TransactionCategory
  type: 'income' | 'expense'
}

export interface CustomCategory {
  id: string
  name: string
  budget: number
  spent: number
  transactions: Transaction[]
  createdAt: Date
}
  
  export interface Budget {
    id: string
    category: string
    limit: number
    current: number
  }
  
  export interface CustomCategory {
    id: string
    name: string
    budget: number
    spent: number
    transactions: Transaction[]
    createdAt: Date
  }
  
  export interface AppState {
    transactions: Transaction[]
    budgets: Budget[]
    savingsGoals: SavingsGoal[]
    alerts: string[]
    customCategories: CustomCategory[]
  }
  
  export interface BudgetContextType {
    state: AppState
    addTransaction: (transaction: Transaction) => void
    addBudget: (budget: Budget) => void
    addSavingsGoal: (goal: SavingsGoal) => void
    getCategorySpending: (category: string) => number
    resetDemoData: () => void
    totalIncome: number
    totalExpenses: number
    balance: number
    customCategories: CustomCategory[]
    addCustomCategory: (name: string, budget: number) => void
    addCustomTransaction: (categoryId: string, transaction: Omit<Transaction, 'id'>) => void
    removeTransaction: (transactionId: string) => void;
    removeBudget: (budgetId: string) => void;
    updateBudget: (updatedBudget: Budget) => void;
  }