"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { History, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AnalysisHistoryItem {
  id: string;
  created_at: string;
  video_title: string | null;
  video_url: string;
  video_id: string | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_comments: number;
  credits_used: number;
  is_premium: boolean;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const filteredHistory = history.filter((item) => {
    if (filter === "premium") return item.is_premium;
    if (filter === "basic") return !item.is_premium;
    return true;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalCreditsUsed = history.reduce((sum, h) => sum + h.credits_used, 0);
  const premiumCount = history.filter((h) => h.is_premium).length;
  const basicCount = history.filter((h) => !h.is_premium).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 font-heading">Riwayat Analisis</h1>
              <p className="text-sm text-slate-500">Lihat semua analisis video yang telah dilakukan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua</option>
              <option value="premium">Premium Only</option>
              <option value="basic">Basic Only</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">Belum ada riwayat</h3>
            <p className="mt-1 text-sm text-slate-500">Analisis video YouTube untuk melihat riwayat di sini</p>
          </div>
        ) : (
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
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentimen</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kredit</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.video_id && (
                            <img src={`https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg`} alt="" className="h-12 w-16 object-cover rounded-lg" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">{item.video_title || "Untitled"}</p>
                            <p className="text-xs text-slate-500">{item.total_comments} komentar</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-slate-600">{formatDate(item.created_at)}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{item.positive_count}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">{item.negative_count}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{item.neutral_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_premium ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {item.is_premium ? "Premium" : "Basic"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right"><span className="text-sm font-medium text-amber-600">{item.credits_used}</span></td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/history/${item.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <span className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Analisis", value: String(history.length) },
            { label: "Total Kredit Digunakan", value: String(totalCreditsUsed) },
            { label: "Premium Analysis", value: String(premiumCount) },
            { label: "Basic Analysis", value: String(basicCount) },
          ].map((stat, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 card-shadow">
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 font-heading">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
