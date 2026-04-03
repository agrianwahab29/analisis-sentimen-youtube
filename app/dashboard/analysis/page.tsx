"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalysisResultView } from "@/components/dashboard/analysis-result-view";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/types/analysis-result";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const isPremium = searchParams.get("premium") === "true";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setResult(data as AnalysisResult);

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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Menganalisis Komentar...</h2>
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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Analisis Gagal</h2>
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
    <AnalysisResultView
      result={result}
      backHref="/dashboard/main"
      demoWarning={
        showDemoWarning && result.message
          ? { message: result.message, onDismiss: () => setShowDemoWarning(false) }
          : null
      }
    />
  );
}

export default function AnalysisResultsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Memuat...</h2>
          </div>
        </DashboardLayout>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
