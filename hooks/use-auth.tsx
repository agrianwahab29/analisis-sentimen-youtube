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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>; // Add manual refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/session", { 
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        }
      });
      const data = (await res.json()) as { user: AuthUser | null };
      setUser(data.user ?? null);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // Direct redirect to /auth/google for proper PKCE flow
  // Using server-side redirect ensures code_verifier cookie is properly set
  const signInWithGoogle = async () => {
    window.location.href = "/auth/google";
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
    <Provider value={{ user, loading, signInWithGoogle, signOut, refreshSession }}>
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