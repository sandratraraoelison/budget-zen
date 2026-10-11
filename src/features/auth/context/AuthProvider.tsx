"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { userSchema, type AuthMode, type AuthUser } from "../types";

type AuthContextType = {
  user: AuthUser | null;
  authenticate: (mode: AuthMode, input: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children, initialUser }: { children: ReactNode; initialUser: AuthUser | null }) => {
  const [user, setUser] = useState(initialUser);
  useEffect(() => { setUser(initialUser); }, [initialUser]);

  async function authenticate(mode: AuthMode, input: { email: string; password: string; name?: string }) {
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "La connexion a échoué.");
    setUser(userSchema.parse(result.user));
  }

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Déconnexion impossible. Veuillez réessayer.");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
