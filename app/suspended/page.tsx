"use client";

import { motion } from "framer-motion";
import { Ban, LogOut, Mail, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl bg-white p-8 shadow-2xl border border-rose-100">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25">
              <Ban className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 font-heading mb-2">
              Akun Ditangguhkan
            </h1>
            <p className="text-slate-500">
              Akses akun Anda telah dibatasi oleh admin
            </p>
          </div>

          {/* Warning Box */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Penangguhan Aktif
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Anda tidak dapat mengakses dashboard atau menggunakan fitur analisis hingga akun diaktifkan kembali.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="mailto:agrianwahab10@gmail.com"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Hubungi Admin
            </a>

            <Link
              href="/auth/logout"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi admin untuk
            penjelasan lebih lanjut.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
