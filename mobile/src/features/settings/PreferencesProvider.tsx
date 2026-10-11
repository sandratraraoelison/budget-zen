import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
const messages = {
  categoryNameOptional: ["Nom de catégorie (optionnel)", "Category name (optional)"],
  categoryNameHint: ["Laissez vide pour utiliser Autres", "Leave blank to use Other"],
  budgetsHint: ["Suivez vos limites de dépenses par catégorie.", "Track your spending limits by category."],
  loadingPage: ["Chargement de la page…", "Loading page…"],
  chooseDate: ["Choisir une date", "Choose a date"],
  clearDate: ["Effacer la date", "Clear date"],
  newProject: ["Nouveau projet", "New project"],
  newCredit: ["Nouveau crédit", "New loan"],
  newBusinessTransaction: ["Nouvelle opération", "New business transaction"],
  newBudget: ["Nouveau budget", "New budget"],
  projectName: ["Nom du projet", "Project name"],
  initialFund: ["Fonds initial", "Initial funds"],
  startDate: ["Date de début", "Start date"],
  endDate: [
    "Échéance facultative",
    "Optional due date",
  ],
  invalidDateRange: [
    "L’échéance doit suivre la date de début.",
    "The due date must be on or after the start date.",
  ],
  creditType: ["Type de crédit", "Loan type"],
  contact: ["Contact", "Contact"],
  transactionType: ["Type d’opération", "Transaction type"],
  category: ["Catégorie", "Category"],
  transactionDescription: ["Description", "Description"],
  budgetLimit: ["Limite du budget", "Budget limit"],
  synchronized: [
    "Vos modifications ont été synchronisées.",
    "Your changes have been synchronized.",
  ],
  operationDone: ["C’est fait", "Done"],
  operationFailed: ["Échec de l’opération", "Operation failed"],
  created: ["Ajout enregistré.", "Item created."],
  updated: ["Modifications enregistrées.", "Changes saved."],
  deleted: ["Suppression effectuée.", "Item deleted."],
  queued: [
    "Enregistré sur cet appareil, en attente de synchronisation.",
    "Saved on this device, waiting to synchronize.",
  ],
  offline: ["Mode hors ligne", "Offline mode"],
  synchronizing: ["Synchronisation en cours", "Synchronizing"],
  waitingSync: ["Modifications en attente", "Changes waiting to sync"],
  pendingChanges: [
    "modification(s) en attente de synchronisation",
    "change(s) waiting to sync",
  ],
  retrySync: ["Synchroniser maintenant", "Sync now"],
  discardFailed: [
    "Supprimer les modifications refusees",
    "Discard rejected changes",
  ],
  discardHint: [
    "Seules les modifications refusees par le serveur seront supprimees de cet appareil.",
    "Only changes rejected by the server will be removed from this device.",
  ],
  pendingTransaction: ["En attente de synchronisation", "Waiting to sync"],
  quickActions: ["Acc\u00e8s rapides", "Quick actions"],
  overview: ["Votre vue d’ensemble", "Your overview"],
  dashboardHint: [
    "Vos finances, en un coup d’œil.",
    "Your finances at a glance.",
  ],
  swipeHint: [
    "Glissez pour voir les autres montants",
    "Swipe to see the other amounts",
  ],
  noBudgets: ["Vos budgets apparaîtront ici", "Your budgets will appear here"],
  noTransactions: ["Votre historique commence ici", "Your history starts here"],
  transactionHint: [
    "Ajoutez une transaction pour suivre vos finances.",
    "Add a transaction to track your finances.",
  ],
  projectsHint: [
    "Gardez vos objectifs et vos dépenses en vue.",
    "Keep your goals and spending in sight.",
  ],
  creditsHint: [
    "Suivez vos prêts et vos remboursements.",
    "Track your loans and repayments.",
  ],
  businessHint: [
    "Les chiffres essentiels du mois en cours.",
    "Key figures for the current month.",
  ],
  appearance: ["Personnalisez votre espace", "Make it your own"],
  light: ["Clair", "Light"],
  dark: ["Sombre", "Dark"],
  home: ["Accueil", "Home"],
  login: ["Connexion", "Sign in"],
  register: ["Inscription", "Sign up"],
  name: ["Nom", "Name"],
  email: ["Adresse email", "Email address"],
  password: ["Mot de passe", "Password"],
  confirmation: ["Confirmer le mot de passe", "Confirm password"],
  refresh: ["Actualiser", "Refresh"],
  welcome: [
    "Votre argent, l’esprit tranquille.",
    "Your money, your mind at ease.",
  ],
  dashboard: ["Tableau de bord", "Dashboard"],
  projects: ["Projets", "Projects"],
  credits: ["Crédits", "Loans"],
  business: ["Business", "Business"],
  settings: ["Réglages", "Settings"],
  loading: ["Chargement…", "Loading…"],
  retry: ["Réessayer", "Try again"],
  empty: ["Aucune donnée pour le moment.", "No data yet."],
  logout: ["Déconnexion", "Sign out"],
  balance: ["Solde disponible", "Available balance"],
  income: ["Revenus", "Income"],
  expenses: ["Dépenses", "Expenses"],
  show: ["Afficher le montant", "Show amount"],
  hide: ["Masquer le montant", "Hide amount"],
  transaction: ["Nouvelle transaction", "New transaction"],
  amount: ["Montant", "Amount"],
  description: ["Description (optionnelle)", "Description (optional)"],
  date: ["Date", "Date"],
  save: ["Enregistrer", "Save"],
  cancel: ["Annuler", "Cancel"],
  history: ["Transactions récentes", "Recent transactions"],
  budgets: ["Budgets", "Budgets"],
  currency: ["Devise du compte", "Account currency"],
  currencyWarning: [
    "Les montants sont conservés sans conversion.",
    "Amounts remain unchanged, with no conversion.",
  ],
  theme: ["Thème clair / sombre", "Light / dark theme"],
  language: ["Langue", "Language"],
  profit: ["Résultat net du mois", "Net profit this month"],
  remaining: ["Restant", "Remaining"],
  active: ["En cours", "In progress"],
  completed: ["Achevé", "Completed"],
  borrowed: ["Emprunt", "Borrowed"],
  lent: ["Prêt", "Lent"],
  salaire: ["Salaire", "Salary"],
  loyer: ["Loyer", "Rent"],
  nourriture: ["Nourriture", "Food"],
  transport: ["Transport", "Transport"],
  santé: ["Santé", "Health"],
  loisirs: ["Loisirs", "Leisure"],
  éducation: ["Éducation", "Education"],
  autres: ["Autres", "Other"],
} as const;
type Language = "fr" | "en";
type Theme = "system" | "light" | "dark";
function usePreferencesState() {
  const system = useColorScheme();
  const [language, setLanguage] = useState<Language>("fr");
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    SecureStore.getItemAsync("budgetzen.preferences")
      .then((saved) => {
        if (!saved) return;
        const value = JSON.parse(saved);
        if (value.language === "fr" || value.language === "en")
          setLanguage(value.language);
        if (["light", "dark", "system"].includes(value.theme))
          setTheme(value.theme);
      })
      .catch(() => {});
  }, []);
  function update(nextLanguage: Language, nextTheme: Theme) {
    setLanguage(nextLanguage);
    setTheme(nextTheme);
    void SecureStore.setItemAsync(
      "budgetzen.preferences",
      JSON.stringify({ language: nextLanguage, theme: nextTheme }),
    ).catch(() => {});
  }
  const dark = theme === "dark" || (theme === "system" && system === "dark");
  return {
    language,
    theme,
    dark,
    update,
    locale: language === "fr" ? "fr-FR" : "en-US",
    colors: {
      background: dark ? "#101122" : "#f6f5fb",
      card: dark ? "#1b1d34" : "#ffffff",
      text: dark ? "#f5f4ff" : "#252441",
      muted: dark ? "#b8b9d0" : "#73738b",
      border: dark ? "#30334e" : "#eeedf6",
      primary: "#6054e8",
      accent: dark ? "#b2aaff" : "#6054e8",
      danger: dark ? "#ffadbd" : "#c34463",
      soft: dark ? "#252740" : "#f5f4fa",
      accentSoft: dark ? "#302b52" : "#efedff",
      blueSoft: dark ? "#223952" : "#eaf4ff",
      coralSoft: dark ? "#452b3b" : "#fff0f3",
      blue: dark ? "#a3d0ff" : "#306bac",
      coral: dark ? "#ffb3c3" : "#ad395c",
    },
    t: (key: keyof typeof messages) =>
      messages[key][language === "fr" ? 0 : 1] as string,
  };
}
const Context = createContext<ReturnType<typeof usePreferencesState> | null>(
  null,
);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const value = usePreferencesState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider missing");
  return value;
}
