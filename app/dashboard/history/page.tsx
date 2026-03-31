"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { History, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface AnalysisHistoryItem {
  id: string;
  date: string;
  videoTitle: string;
  videoUrl: string;
  thumbnail: string;
  positive: number;
  negative: number;
  neutral: number;
  creditsUsed: number;
  isPremium: boolean;
}

const dummyHistory: AnalysisHistoryItem[] = [
  {
    id: "1",
    date: "2026-03-31T10:00:00",
    videoTitle: "Cara Membuat Konten Viral di YouTube 2026",
    videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    positive: 1247,
    negative: 423,
    neutral: 330,
    creditsUsed: 20,
    isPremium: true,
  },
  {
    id: "2",
    date: "2026-03-28T15:30:00",
    videoTitle: "Tutorial Python untuk Pemula",
    videoUrl: "https://youtube.com/watch?v=abc123",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    positive: 856,
    negative: 234,
    neutral: 410,
    creditsUsed: 15,
    isPremium: false,
  },
  {
    id: "3",
    date: "2026-03-25T09:15:00",
    videoTitle: "Review iPhone 16 Pro Max",
    videoUrl: "https://youtube.com/watch?v=xyz789",
    thumbnail: "https://img.youtube.com/vi/xyz789/mqdefault.jpg",
    positive: 2100,
    negative: 567,
    neutral: 433,
    creditsUsed: 30,
    isPremium: true,
  },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredHistory = dummyHistory.filter((item) => {
    if (filter === "premium") return item.isPremium;
    if (filter === "basic") return !item.isPremium;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-xl font-semibold text-slate-900 font-heading">
                Riwayat Analisis
              </h1>
              <p className="text-sm text-slate-500">
                Lihat semua analisis video yang telah dilakukan
              </p>
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

            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* History Table */}
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sentimen
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kredit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt={item.videoTitle}
                          className="h-12 w-16 object-cover rounded-lg"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                            {item.videoTitle}
                          </p>
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Lihat video
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{formatDate(item.date)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {item.positive}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          {item.negative}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {item.neutral}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Basic
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-amber-600">
                        {item.creditsUsed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <span className="text-sm text-slate-500">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-4"
        >
          {[
            { label: "Total Analisis", value: "24" },
            { label: "Total Kredit Digunakan", value: "450" },
            { label: "Premium Analysis", value: "8" },
            { label: "Basic Analysis", value: "16" },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5 card-shadow"
            >
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 font-heading">
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
