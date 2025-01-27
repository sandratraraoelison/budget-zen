import { NextResponse } from 'next/server'
import { Budget, SavingsGoal, Transaction } from '@/types/budget'

export const POST = async () => {
  // Données de démo
  const demoData = {
    transactions: [
      {
        id: '1',
        amount: 1200,
        date: new Date('2024-01-05'),
        description: 'Loyer janvier',
        category: 'loyer',
        type: 'expense'
      },
      {
        id: '2',
        amount: 450,
        date: new Date('2024-01-15'),
        description: 'Courses Carrefour',
        category: 'nourriture',
        type: 'expense'
      }
    ] as Transaction[],
    budgets: [
      {
        id: '1',
        category: 'nourriture',
        limit: 500,
        current: 450
      }
    ] as Budget[],
    savingsGoals: [
      {
        id: '1',
        name: 'Vacances été',
        target: 3000,
        current: 1200,
        deadline: new Date('2024-06-01')
      }
    ] as SavingsGoal[]
  }

  return NextResponse.json(demoData)
}