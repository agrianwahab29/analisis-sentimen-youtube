"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CreditBadgeProps {
  credits: number;
}

export function CreditBadge({ credits }: CreditBadgeProps) {
  // Format angka dengan ribuan separator
  const formattedCredits = new Intl.NumberFormat("id-ID").format(credits);

  return (
    <Link href="/dashboard/topup">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer"
      >
        {/* Credit Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>

        {/* Credit Info */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500">Saldo Kredit</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-heading tracking-tight">
              {formattedCredits}
            </span>
            <span className="text-xs text-slate-400">kredit</span>
          </div>
        </div>

        {/* Top Up Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          + Top Up
        </motion.button>
      </motion.div>
    </Link>
  );
}
