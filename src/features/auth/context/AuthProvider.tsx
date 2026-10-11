"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  isDemo: boolean;
  loginDemo: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isDemo, setIsDemo] = useState(false);

  const loginDemo = () => setIsDemo(true);

  return (
    <AuthContext.Provider value={{ isDemo, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
