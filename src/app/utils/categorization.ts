//categorization.ts
export const autoCategorize = (description: string): string => {
    const keywords: Record<string, string[]> = {
      loyer: ['loyer', 'rent', 'appartement'],
      nourriture: ['supermarché', 'épicerie', 'courses', 'alimentation', 'food'],
      transport: ['essence', 'station', 'bus', 'métro', 'transport'],
      loisirs: ['cinéma', 'streaming', 'sport', 'musique', 'jeux'],
      santé: ['pharmacie', 'médecin', 'hôpital', 'dentiste'],
    }
  
    const lowerDesc = description.toLowerCase()
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerDesc.includes(term))) {
        return category
      }
    }
    return 'autre'
  }

  export const TRANSACTION_CATEGORIES = [
    'salaire',
    'loyer',
    'nourriture',
    'transport',
    'loisirs',
    'santé',
    'éducation',
    'autres'
  ] as const
  
  export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]
  
  export const getCategoryLabel = (category: TransactionCategory) => {
    const labels: Record<TransactionCategory, string> = {
      salaire: '💼 Salaire',
      loyer: '🏠 Loyer',
      nourriture: '🛒 Nourriture',
      transport: '🚗 Transport',
      loisirs: '🎉 Loisirs',
      santé: '🏥 Santé',
      éducation: '📚 Éducation',
      autres: '❔ Autres'
    }
    return labels[category]
  }