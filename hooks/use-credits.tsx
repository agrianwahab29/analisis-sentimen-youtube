"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface CreditContextType {
  credits: number | null;
  refreshCredits: () => Promise<void>;
  isLoading: boolean;
}

const CreditContext = createContext<CreditContextType>({
  credits: null,
  refreshCredits: async () => {},
  isLoading: false,
});

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.credit_balance !== undefined) {
          setCredits(data.user.credit_balance);
        }
      }
    } catch (err) {
      console.error("Failed to refresh credits:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Poll every 30 seconds for sync (AGR-16)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCredits();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshCredits]);

  // Listen for visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCredits();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refreshCredits]);

  return (
    <CreditContext.Provider value={{ credits, refreshCredits, isLoading }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}
