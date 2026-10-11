export const getCustomCategoryLabel = (name: string) => {
  const normalized = name.trim().toLocaleLowerCase();
  const icon = /^(animaux|animal|pets?)$/.test(normalized) ? "🐾" : "🏷️";
  return `${icon} ${name}`;
};

//categorization.ts
export const autoCategorize = (description: string): TransactionCategory => {
    const keywords: Partial<Record<TransactionCategory, string[]>> = {
      loyer: ['loyer', 'rent', 'appartement'],
      nourriture: ['supermarché', 'épicerie', 'courses', 'alimentation', 'food'],
      transport: ['essence', 'station', 'bus', 'métro', 'transport'],
      loisirs: ['cinéma', 'streaming', 'sport', 'musique', 'jeux'],
      santé: ['pharmacie', 'médecin', 'hôpital', 'dentiste'],
    }
  
    const lowerDesc = description.toLowerCase()
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerDesc.includes(term))) {
        return category as TransactionCategory
      }
    }
    return 'autres'
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
  
  export const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      salaire: '💼 Salaire',
      loyer: '🏠 Loyer',
      nourriture: '🛒 Nourriture',
      transport: '🚗 Transport',
      loisirs: '🎉 Loisirs',
      santé: '🏥 Santé',
      éducation: '📚 Éducation',
      autres: '❔ Autres'
    }
    return labels[category] ?? category
  }
