"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { validateYouTubeURL, sanitizeInput } from "@/lib/validation";
import { AnalysisProgress } from "@/components/ui/skeletons";

export function AnalysisInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const handleAnalyze = async () => {
    // Sanitize input
    const sanitizedUrl = sanitizeInput(url);
    
    // Validate URL
    const validation = validateYouTubeURL(sanitizedUrl);
    if (!validation.isValid) {
      setError(validation.error || "URL tidak valid");
      setShowValidation(true);
      return;
    }

    setError("");
    setShowValidation(false);
    setIsAnalyzing(true);
    setProgress(0);
    setProgressMessage("Memvalidasi URL...");

    // Simulate progress steps
    const steps = [
      { progress: 10, message: "Mengambil data video...", delay: 800 },
      { progress: 30, message: "Mengambil komentar...", delay: 1500 },
      { progress: 50, message: "Menganalisis sentimen...", delay: 2000 },
      { progress: 80, message: "Menghasilkan insight...", delay: 1000 },
      { progress: 100, message: "Selesai!", delay: 500 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setProgress(step.progress);
      setProgressMessage(step.message);
    }

    // Navigate to analysis page with query params
    const params = new URLSearchParams();
    params.set("url", sanitizedUrl);
    params.set("premium", isPremium.toString());

    router.push(`/dashboard/analysis?${params.toString()}`);
  };

  const getValidationIcon = () => {
    if (!url) return null;
    const validation = validateYouTubeURL(url);
    return validation.isValid ? (
      <CheckCircle className="h-4 w-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
    ) : showValidation ? (
      <AlertCircle className="h-4 w-4 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
    ) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <Link2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-heading">
            Analisis Video YouTube
          </h2>
          <p className="text-sm text-slate-500">
            Masukkan URL video untuk menganalisis sentimen komentar
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full rounded-lg border ${
                error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              } bg-white px-4 py-3.5 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all`}
            />
            <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.p>
          )}
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <button
            onClick={() => setIsPremium(!isPremium)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPremium ? "bg-blue-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPremium ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${isPremium ? "text-amber-500" : "text-slate-400"}`} />
            <span className="text-sm font-medium text-slate-700">
              Analisis Premium (AI Insight)
            </span>
          </div>

          <span className="ml-auto text-xs font-medium text-slate-500">
            {isPremium ? "2 kredit / 10 komentar" : "1 kredit / 10 komentar"}
          </span>
        </div>

        {/* Analyze Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={!url || isAnalyzing}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Memuat...
            </>
          ) : (
            <>
              Mulai Analisis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
