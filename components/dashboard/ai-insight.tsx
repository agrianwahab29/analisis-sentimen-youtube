"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, MessageSquare } from "lucide-react";

interface AIInsightProps {
  summary: string;
  complaints: string[];
  suggestions: string[];
}

export function AIInsight({ summary, complaints, suggestions }: AIInsightProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-6 card-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 font-heading">
              AI Insight
            </h3>
            <p className="text-sm text-slate-500">
              Analisis cerdas dari komentar
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-amber-100/50 transition-colors"
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
          className="space-y-4"
        >
          {/* Summary */}
          <div className="bg-white/60 rounded-lg p-4 border border-amber-100">
            <p className="text-slate-700 leading-relaxed">{summary}</p>
          </div>

          {/* Complaints */}
          {complaints.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h4 className="font-semibold text-slate-900">Keluhan Utama</h4>
              </div>
              <ul className="space-y-2">
                {complaints.map((complaint, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="text-rose-400 mt-1">•</span>
                    {complaint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <h4 className="font-semibold text-slate-900">
                  Saran Konten Berikutnya
                </h4>
              </div>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="text-emerald-400 mt-1">→</span>
                    {suggestion}
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
