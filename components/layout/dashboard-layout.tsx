"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { CreditBadge } from "./credit-badge";
import { UserNav } from "./user-nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900 font-heading">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <CreditBadge credits={1250} />
            <div className="h-8 w-px bg-slate-200" />
            <UserNav />
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
