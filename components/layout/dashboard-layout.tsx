"use client";

import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar, MobileMenuButton } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { normalizeCreditBalance } from "@/lib/normalize-credit-balance";
import { Sparkles, Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const credits = normalizeCreditBalance(
    user ? (user as Record<string, unknown>).credit_balance : undefined
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Desktop only, Mobile drawer handled inside Sidebar */}
      <Sidebar isMobile isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile hamburger menu */}
            <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <h1 className="text-lg md:text-xl font-semibold text-slate-900 font-heading">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: compact credit badge */}
            <Link href="/dashboard/topup" className="md:hidden">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 px-3 py-1.5"
              >
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-slate-900 font-heading">
                  {new Intl.NumberFormat("id-ID").format(credits)}
                </span>
              </motion.div>
            </Link>

            {/* Desktop: full credit badge */}
            <Link href="/dashboard/topup" className="hidden md:block">
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
                  className="ml-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Top Up
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
          className="p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}