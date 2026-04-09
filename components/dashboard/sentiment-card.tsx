"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentCardProps {
  type: "positive" | "negative" | "neutral";
  count: number;
  percentage: number;
  trend?: number;
}

const sentimentConfig = {
  positive: {
    label: "Sentimen Positif",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
  },
  negative: {
    label: "Sentimen Negatif",
    icon: TrendingDown,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    barColor: "bg-rose-500",
  },
  neutral: {
    label: "Sentimen Netral",
    icon: Minus,
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    barColor: "bg-slate-400",
  },
};

export function SentimentCard({ type, count, percentage, trend }: SentimentCardProps) {
  const config = sentimentConfig[type];
  const Icon = config.icon;
  const formattedCount = new Intl.NumberFormat("id-ID").format(count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border bg-white p-4 md:p-6 card-shadow hover:card-shadow-hover transition-all duration-300"
    >
      {/* Icon and Label */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor}`}
          >
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <span className="text-sm font-medium text-slate-600">{config.label}</span>
        </div>
        
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <span>{trend >= 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>

      {/* Count and Percentage */}
      <div className="flex items-baseline gap-2 mb-3 md:mb-4">
        <span className="text-2xl md:text-3xl font-bold text-slate-900 font-heading tracking-tight">
          {formattedCount}
        </span>
        <span className="text-xs md:text-sm text-slate-500">komentar</span>
      </div>

      {/* Percentage Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Persentase</span>
          <span className={`font-semibold ${config.color}`}>{percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={`h-full rounded-full ${config.barColor}`}
          />
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
        style={{
          background: `linear-gradient(135deg, ${config.bgColor.replace("bg-", "")}00 0%, ${config.bgColor.replace("bg-", "")}20 100%)`,
        }}
      />
    </motion.div>
  );
}
