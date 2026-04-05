"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SentimentCard } from "@/components/dashboard/sentiment-card";
import { SentimentPieChart } from "@/components/dashboard/sentiment-pie-chart";
import { SentimentBarChart } from "@/components/dashboard/sentiment-bar-chart";
import { WordCloud } from "@/components/dashboard/word-cloud";
import { AIInsight } from "@/components/dashboard/ai-insight";
import { ArrowLeft, Download, Filter, MessageSquare, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/types/analysis-result";

interface AnalysisResultViewProps {
  result: AnalysisResult;
  backHref: string;
  /** e.g. "Riwayat analisis — 4 April 2026" */
  subtitle?: string | null;
  demoWarning?: { message: string; onDismiss: () => void } | null;
  demoBadge?: {
    type: string;
    title: string;
    message: string;
    action?: { label: string; href: string };
  } | null;
}

export function AnalysisResultView({
  result,
  backHref,
  subtitle,
  demoWarning,
  demoBadge,
}: AnalysisResultViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "comments">("overview");
  const [sentimentFilter, setSentimentFilter] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");

  const filteredComments = result.comments.filter((c) =>
    sentimentFilter === "all" ? true : c.sentiment === sentimentFilter
  );

  const handleExport = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analysis-${result.videoInfo.id}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatePresence>
          {demoWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">{demoWarning.message}</p>
              </div>
              <button
                type="button"
                onClick={demoWarning.onDismiss}
                className="text-amber-600 hover:text-amber-800"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Mode Badge - AGR-13 */}
        {demoBadge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-amber-300 bg-amber-50 p-3 flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">{demoBadge.title}</p>
              <p className="text-xs text-amber-700">{demoBadge.message}</p>
            </div>
            {demoBadge.action && (
              <a
                href={demoBadge.action.href}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 underline flex-shrink-0"
              >
                {demoBadge.action.label}
              </a>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start gap-4 p-6 rounded-xl border border-slate-200 bg-white card-shadow"
        >
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>

          <div className="flex gap-4 flex-1">
            <img
              src={result.videoInfo.thumbnail}
              alt={result.videoInfo.title}
              className="h-24 w-40 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 font-heading line-clamp-2">
                {result.videoInfo.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{result.videoInfo.channelTitle}</p>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                <span>{result.videoInfo.totalComments.toLocaleString("id-ID")} komentar</span>
                <span>{result.videoInfo.viewCount.toLocaleString("id-ID")} views</span>
                <span>{result.videoInfo.likeCount.toLocaleString("id-ID")} likes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-500">Kredit digunakan</p>
              <p className="text-2xl font-bold text-amber-600">{result.creditsUsed}</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex gap-6">
            {(
              [
                { id: "overview", label: "Ringkasan", icon: null },
                { id: "comments", label: "Komentar", icon: MessageSquare },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
                {tab.id === "comments" && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
                    {result.comments.length}/{result.sentimentStats.total}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Sample Info Banner - AGR-11 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3"
            >
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>Analisis Sampel:</strong> Menampilkan {result.comments.length} komentar representatif 
                  dari total {result.sentimentStats.total.toLocaleString("id-ID")} komentar yang dianalisis. 
                  Sampel dipilih berdasarkan relevansi dan engagement (likes) untuk memberikan gambaran 
                  akurat dari keseluruhan sentimen.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              <SentimentCard
                type="positive"
                count={result.sentimentStats.positive}
                percentage={parseFloat(result.percentages.positive)}
                trend={12}
              />
              <SentimentCard
                type="negative"
                count={result.sentimentStats.negative}
                percentage={parseFloat(result.percentages.negative)}
                trend={-5}
              />
              <SentimentCard
                type="neutral"
                count={result.sentimentStats.neutral}
                percentage={parseFloat(result.percentages.neutral)}
                trend={3}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SentimentPieChart data={result.sentimentStats} />
              <SentimentBarChart data={result.sentimentStats} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <WordCloud words={result.wordCloud} />

              {result.aiInsight ? (
                <AIInsight
                  summary={result.aiInsight.summary}
                  complaints={result.aiInsight.complaints}
                  suggestions={result.aiInsight.suggestions}
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">AI Insight</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Analisis ini tidak menyertakan insight AI (Basic) atau snapshot tidak tersedia.
                  </p>
                  <Link
                    href="/dashboard/main"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Analisis Premium →
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
                <div className="flex gap-1">
                  {(["all", "positive", "negative", "neutral"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSentimentFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        sentimentFilter === filter
                          ? filter === "positive"
                            ? "bg-emerald-100 text-emerald-700"
                            : filter === "negative"
                              ? "bg-rose-100 text-rose-700"
                              : filter === "neutral"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-sm text-slate-500">
                Menampilkan {filteredComments.length} dari {result.comments.length} sampel komentar
                {" "}
                ({result.sentimentStats.total.toLocaleString("id-ID")} total dianalisis)
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-slate-200 bg-white card-shadow overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Komentar
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Sentimen
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Likes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComments.slice(0, 50).map((comment, index) => (
                      <motion.tr
                        key={comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div>
                            <p className="text-sm text-slate-900 line-clamp-2">{comment.text}</p>
                            <p className="text-xs text-slate-500 mt-1">@{comment.author}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              comment.sentiment === "positive"
                                ? "bg-emerald-100 text-emerald-700"
                                : comment.sentiment === "negative"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {comment.sentiment === "positive"
                              ? "Positif"
                              : comment.sentiment === "negative"
                                ? "Negatif"
                                : "Netral"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="text-sm text-slate-600">
                            {comment.likes.toLocaleString("id-ID")}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
