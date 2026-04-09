"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, MessageSquare } from "lucide-react";
import { sanitizeInsightPlainText } from "@/lib/utils/insight-plain-text";

interface AIInsightProps {
  summary: string;
  complaints: string[];
  suggestions: string[];
}

export function AIInsight({ summary, complaints, suggestions }: AIInsightProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const cleanSummary = useMemo(() => sanitizeInsightPlainText(summary), [summary]);
  const cleanComplaints = useMemo(
    () => complaints.map((c) => sanitizeInsightPlainText(c)),
    [complaints]
  );
  const cleanSuggestions = useMemo(
    () => suggestions.map((s) => sanitizeInsightPlainText(s)),
    [suggestions]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 md:p-6 card-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 font-heading">
              AI Insight
            </h3>
            <p className="text-xs md:text-sm text-slate-500">
              Analisis cerdas dari komentar
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-amber-100/50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 md:space-y-4"
        >
          {/* Summary */}
          <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-amber-100">
            <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">{cleanSummary}</p>
          </div>

          {/* Complaints */}
          {cleanComplaints.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h4 className="font-semibold text-slate-900 text-sm md:text-base">Keluhan Utama</h4>
              </div>
              <ul className="space-y-2">
                {cleanComplaints.map((complaint, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs md:text-sm text-slate-600"
                  >
                    <span className="text-rose-400 mt-1">•</span>
                    <span className="whitespace-pre-line">{complaint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {cleanSuggestions.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <h4 className="font-semibold text-slate-900 text-sm md:text-base">
                  Saran Konten Berikutnya
                </h4>
              </div>
              <ul className="space-y-2">
                {cleanSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs md:text-sm text-slate-600"
                  >
                    <span className="text-emerald-400 mt-1">→</span>
                    <span className="whitespace-pre-line">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
