"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  History,
  FileJson,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types/analysis-result";

interface PostAnalysisModalProps {
  isOpen: boolean;
  result: AnalysisResult;
  analysisId?: string;
  allComments?: AnalysisResult["comments"];
  onExport: (format: "json" | "html") => void;
  onStay: () => void;
  onExit: () => void;
  isExporting: boolean;
  isDeleting: boolean;
}

export function PostAnalysisModal({
  isOpen,
  result,
  analysisId,
  allComments,
  onExport,
  onStay,
  onExit,
  isExporting,
  isDeleting,
}: PostAnalysisModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"json" | "html">("json");
  const totalComments = result.sentimentStats.total;
  const sampleComments = result.comments.length;

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md max-w-[calc(100%-2rem)] mx-4 p-4 md:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base md:text-lg">Analisis Selesai!</DialogTitle>
              <DialogDescription className="mt-1 text-xs md:text-sm">
                Video telah berhasil dianalisis dengan {totalComments.toLocaleString("id-ID")} komentar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 md:py-4">
          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4"
          >
            <h4 className="text-sm font-semibold text-slate-900 mb-2 md:mb-3 flex items-center gap-2">
              <FileJson className="h-4 w-4 text-slate-500" />
              Export Data Lengkap
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Simpan hasil analisis lengkap dengan semua {totalComments.toLocaleString("id-ID")} komentar 
              dalam format JSON atau HTML.
            </p>

            {/* Format Selection */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSelectedFormat("json")}
                className={`flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg border transition-all min-h-[64px] md:min-h-[72px] ${
                  selectedFormat === "json"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <FileJson className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs font-medium">JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat("html")}
                className={`flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg border transition-all min-h-[64px] md:min-h-[72px] ${
                  selectedFormat === "html"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs font-medium">HTML</span>
              </button>
            </div>

            <Button
              onClick={() => onExport(selectedFormat)}
              disabled={isExporting}
              className="w-full min-h-[40px]"
              variant="default"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengeksport...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Catatan:</strong> Data di halaman ini menampilkan {sampleComments} komentar sampel 
              dari total {totalComments} komentar. Export lengkap akan menyertakan semua komentar.
            </p>
          </motion.div>

          {/* Decision Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-slate-200 p-3 md:p-4"
          >
            <h4 className="text-sm font-semibold text-slate-900 mb-2 md:mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              Apakah keluar analisis?
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Pilih opsi berikut untuk menentukan apa yang terjadi dengan analisis ini:
            </p>

            <div className="space-y-2">
              <Button
                onClick={onStay}
                disabled={isDeleting}
                variant="outline"
                className="w-full justify-start min-h-[56px] md:min-h-[48px] px-3 py-2.5 md:py-2"
              >
                <History className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="block text-sm font-medium">Tidak, Simpan di Riwayat</span>
                  <span className="block text-xs text-slate-500">
                    Analisis akan tersimpan dan dapat diakses kapan saja
                  </span>
                </div>
              </Button>

              <Button
                onClick={onExit}
                disabled={isDeleting || !analysisId}
                variant="destructive"
                className="w-full justify-start min-h-[56px] md:min-h-[48px] px-3 py-2.5 md:py-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <span className="block text-sm font-medium">Ya, Hapus dan Keluar</span>
                      <span className="block text-xs text-slate-500">
                        Hapus analisis dan kembali ke dashboard
                      </span>
                    </div>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="border-t bg-slate-50/50 px-4 md:px-6 py-3 md:py-4">
          <p className="text-[10px] md:text-xs text-slate-400 text-center w-full">
            Analisis ID: {analysisId || "Demo Mode"} • {totalComments.toLocaleString("id-ID")} komentar
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
