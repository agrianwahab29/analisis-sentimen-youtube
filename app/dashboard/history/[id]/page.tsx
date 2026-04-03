"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalysisResultView } from "@/components/dashboard/analysis-result-view";
import type { AnalysisResult } from "@/lib/types/analysis-result";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface HistoryPartialPayload {
  success: true;
  partial: true;
  created_at: string;
  video_url: string;
  video_title: string | null;
  video_id: string | null;
  total_comments: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  credits_used: number;
  is_premium: boolean;
  message?: string;
}

function isAnalysisResultShape(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return (
    !!o.videoInfo &&
    !!o.sentimentStats &&
    !!o.percentages &&
    Array.isArray(o.comments) &&
    typeof o.creditsUsed === "number"
  );
}

function formatHistorySubtitle(createdAt: string) {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function HistoryDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [partial, setPartial] = useState<HistoryPartialPayload | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID riwayat tidak valid");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/history/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat riwayat");
        }

        if (data.partial === true) {
          setPartial(data as HistoryPartialPayload);
          setSubtitle(formatHistorySubtitle((data as HistoryPartialPayload).created_at));
        } else if (isAnalysisResultShape(data)) {
          const full = data as AnalysisResult & { created_at?: string };
          setResult({
            videoInfo: full.videoInfo,
            sentimentStats: full.sentimentStats,
            percentages: full.percentages,
            creditsUsed: full.creditsUsed,
            aiInsight: full.aiInsight ?? null,
            wordCloud: full.wordCloud ?? [],
            comments: full.comments,
            demo: full.demo,
            message: full.message,
          });
          setSubtitle(
            typeof full.created_at === "string"
              ? `Riwayat — ${formatHistorySubtitle(full.created_at)}`
              : null
          );
        } else {
          setError("Format respons tidak dikenali");
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-600">Memuat detail riwayat…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center">
          <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Tidak dapat memuat detail</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Riwayat
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (partial) {
    const analysisHref = `/dashboard/analysis?url=${encodeURIComponent(partial.video_url)}&premium=${partial.is_premium ? "true" : "false"}`;
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-6">
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Riwayat
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3"
          >
            <h1 className="text-lg font-semibold text-slate-900">Ringkasan saja</h1>
            <p className="text-sm text-amber-900/90">
              {partial.message ||
                "Detail penuh (grafik, word cloud, sampel komentar) belum tersimpan untuk entri ini — biasanya karena analisis dilakukan sebelum fitur snapshot aktif."}
            </p>
            <p className="text-xs text-slate-500">{subtitle}</p>
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 space-y-2">
              <p className="font-medium">{partial.video_title || partial.video_id || "Video"}</p>
              <p>
                Total: {partial.total_comments} komentar · +{partial.positive_count} / −
                {partial.negative_count} / ○{partial.neutral_count}
              </p>
              <p>Kredit: {partial.credits_used}</p>
            </div>
            <Link
              href={analysisHref}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Analisis ulang untuk detail lengkap
            </Link>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (result) {
    return (
      <AnalysisResultView
        result={result}
        backHref="/dashboard/history"
        subtitle={subtitle}
      />
    );
  }

  return null;
}
