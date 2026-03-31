// Auth hook for managing user authentication
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type AuthUser = {
  id: string;
  email: string | null;
  [key: string]: unknown;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; emailConfirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json()) as { user: AuthUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: true; error?: string };

      if (!res.ok) return { error: data.error ?? "Gagal masuk. Coba lagi." };
      await refreshSession();
      return { error: null };
    } catch {
      return { error: "Gagal masuk. Coba lagi." };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = (await res.json()) as {
        ok?: true;
        error?: string;
        emailConfirmationRequired?: boolean;
      };

      if (!res.ok) return { error: data.error ?? "Gagal mendaftar." };
      await refreshSession();
      return {
        error: null,
        emailConfirmationRequired: data.emailConfirmationRequired,
      };
    } catch {
      return { error: "Gagal mendaftar." };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    window.location.href = "/auth/login";
  };

  const { Provider } = AuthContext;
  return (
    <Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
