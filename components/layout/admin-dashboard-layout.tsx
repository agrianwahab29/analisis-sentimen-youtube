"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { AdminSidebar } from "./admin-sidebar";
import { Shield, Bell, Clock, CheckCircle, X } from "lucide-react";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

interface PendingTransaction {
  id: string;
  user_email: string;
  package_name: string;
  price: number;
  total_credits: number;
  created_at: string;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState<PendingTransaction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/transactions?status=pending_verification&limit=5")
      .then((res) => res.json())
      .then((data) => {
        setPendingTx(data.transactions || []);
        setPendingCount(data.total || 0);
      })
      .catch(() => {});
  }, [notifOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Shield className="h-4 w-4 text-violet-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 font-heading">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">
                      Menunggu Verifikasi
                    </span>
                    {pendingCount > 0 && (
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {pendingTx.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <CheckCircle className="mx-auto h-8 w-8 text-emerald-400" />
                      <p className="mt-2 text-sm text-slate-500">
                        Tidak ada pembayaran pending
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {pendingTx.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {tx.user_email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {tx.package_name} &middot; {tx.total_credits} kredit &middot; Rp {tx.price.toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(tx.created_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingCount > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2">
                      <a
                        href="/admin/transactions"
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        Lihat semua ({pendingCount})
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </header>

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
