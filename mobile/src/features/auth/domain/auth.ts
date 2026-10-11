export interface User {
  id: string;
  email: string;
  name: string;
  isDemo: boolean;
  createdAt: string;
}
export type AuthMode = "login" | "register";
export interface Credentials {
  email: string;
  password: string;
  name?: string;
}
export interface Session {
  user: User;
  accessToken: string;
}
export interface AuthRepository {
  authenticate(mode: AuthMode, input: Credentials): Promise<Session>;
  currentUser(): Promise<User>;
}
export function validateCredentials(
  mode: AuthMode,
  input: Credentials,
  confirmation?: string,
): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    return "Saisissez une adresse email valide.";
  if (input.password.length < 12 || input.password.length > 128)
    return "Le mot de passe doit contenir entre 12 et 128 caractères.";
  if (mode === "register" && !input.name?.trim()) return "Saisissez votre nom.";
  if (mode === "register" && input.password !== confirmation)
    return "Les mots de passe ne correspondent pas.";
  return null;
}
