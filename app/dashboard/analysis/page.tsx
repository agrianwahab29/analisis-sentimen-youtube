"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SentimentCard } from "@/components/dashboard/sentiment-card";
import { SentimentPieChart } from "@/components/dashboard/sentiment-pie-chart";
import { SentimentBarChart } from "@/components/dashboard/sentiment-bar-chart";
import { WordCloud } from "@/components/dashboard/word-cloud";
import { AIInsight } from "@/components/dashboard/ai-insight";
import { ArrowLeft, Loader2, AlertCircle, Download, Filter, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Comment {
  id: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  author: string;
  likes: number;
}

interface AnalysisResult {
  videoInfo: {
    id: string;
    title: string;
    thumbnail: string;
    totalComments: number;
    channelTitle: string;
    viewCount: number;
    likeCount: number;
  };
  sentimentStats: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  percentages: {
    positive: string;
    negative: string;
    neutral: string;
  };
  creditsUsed: number;
  aiInsight: {
    summary: string;
    complaints: string[];
    suggestions: string[];
  } | null;
  wordCloud: Array<{ text: string; value: number }>;
  comments: Comment[];
  demo?: boolean;
  message?: string;
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const isPremium = searchParams.get("premium") === "true";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "comments">("overview");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [showDemoWarning, setShowDemoWarning] = useState(false);

  useEffect(() => {
    if (!url) {
      setError("URL video tidak ditemukan");
      setLoading(false);
      return;
    }

    const analyzeVideo = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, isPremium }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Gagal menganalisis video");
        }

        const data = await response.json();
        setResult(data);
        
        if (data.demo) {
          setShowDemoWarning(true);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : null;
        setError(message || "Terjadi kesalahan saat menganalisis video");
      } finally {
        setLoading(false);
      }
    };

    analyzeVideo();
  }, [url, isPremium]);

  const handleExport = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis-${result.videoInfo.id}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const filteredComments = result?.comments.filter((c) =>
    sentimentFilter === "all" ? true : c.sentiment === sentimentFilter
  ) || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Menganalisis Komentar...
            </h2>
            <p className="text-slate-500">
              Mohon tunggu sebentar, AI sedang membaca dan menganalisis sentimen komentar
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Analisis Gagal
            </h2>
            <p className="text-slate-500 mb-6">{error || "Terjadi kesalahan"}</p>
            <Link
              href="/dashboard/main"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Demo Warning */}
        <AnimatePresence>
          {showDemoWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  {result.message}
                </p>
              </div>
              <button
                onClick={() => setShowDemoWarning(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start gap-4 p-6 rounded-xl border border-slate-200 bg-white card-shadow"
        >
          <Link
            href="/dashboard/main"
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
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
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
                    {result.comments.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === "overview" ? (
          <>
            {/* Sentiment Cards */}
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

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <SentimentPieChart data={result.sentimentStats} />
              <SentimentBarChart data={result.sentimentStats} />
            </div>

            {/* Word Cloud & AI Insight */}
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
                    Upgrade ke analisis premium untuk mendapatkan insight cerdas dari AI
                  </p>
                  <Link
                    href="/dashboard/main"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mulai Analisis Premium →
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Comments Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
                <div className="flex gap-1">
                  {(
                    ["all", "positive", "negative", "neutral"] as const
                  ).map((filter) => (
                    <button
                      key={filter}
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
                Menampilkan {filteredComments.length} komentar
              </span>
            </motion.div>

            {/* Comments Table */}
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
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Komentar</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentimen</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Likes</th>
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
                          <span className="text-sm text-slate-600">{comment.likes.toLocaleString("id-ID")}</span>
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

export default function AnalysisResultsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Memuat...
          </h2>
        </div>
      </DashboardLayout>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
