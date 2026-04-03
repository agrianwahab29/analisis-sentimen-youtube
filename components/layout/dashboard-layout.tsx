"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { normalizeCreditBalance } from "@/lib/normalize-credit-balance";
import { Sparkles } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const credits = normalizeCreditBalance(
    user ? (user as Record<string, unknown>).credit_balance : undefined
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900 font-heading">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/topup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 px-4 py-2 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Credit Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 border border-amber-200">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>

                {/* Credit Info */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-amber-600">Saldo</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 font-heading tracking-tight">
                      {new Intl.NumberFormat("id-ID").format(credits)}
                    </span>
                    <span className="text-xs text-slate-500">kredit</span>
                  </div>
                </div>

                {/* Top Up Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Top Up
                </motion.button>
              </motion.div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}