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
  date: ["Date (AAAA-MM-JJ)", "Date (YYYY-MM-DD)"],
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
      background: dark ? "#020617" : "#f6f8fa",
      card: dark ? "#0f172a" : "#ffffff",
      text: dark ? "#f1f5f9" : "#0f172a",
      muted: dark ? "#cbd5e1" : "#64748b",
      border: dark ? "#334155" : "#e2e8f0",
      accent: dark ? "#5eead4" : "#115e59",
      danger: dark ? "#fca5a5" : "#b91c1c",
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
