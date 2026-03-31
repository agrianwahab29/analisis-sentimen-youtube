"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const email = user?.email ?? "user@email.com";
  const initial = email.charAt(0).toUpperCase();
  const displayName = email.split("@")[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-slate-300 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
          <span className="text-xs font-semibold text-white">{initial}</span>
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-slate-900">{displayName}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              <div className="border-b border-slate-100 pb-2 mb-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              </div>
              
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <User className="h-4 w-4" />
                Profil
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Settings className="h-4 w-4" />
                Pengaturan
              </button>
              
              <div className="border-t border-slate-100 pt-2 mt-2">
                <button onClick={() => signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
