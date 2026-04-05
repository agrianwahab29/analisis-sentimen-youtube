"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles, ArrowRight, AlertCircle, CheckCircle, Wallet, X } from "lucide-react";
import { validateYouTubeURL, sanitizeInput } from "@/lib/validation";
import { AnalysisProgress } from "@/components/ui/skeletons";
import Link from "next/link";

export function AnalysisInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(5);

  // Fetch user credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.credit_balance !== undefined) {
            setUserCredits(data.user.credit_balance);
          }
        }
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    };
    fetchCredits();
  }, []);

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

    // Check credits first (AGR-17)
    const needed = isPremium ? 15 : 5;
    setRequiredCredits(needed);
    
    if (userCredits !== null && userCredits < needed) {
      setShowCreditModal(true);
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
    <>
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
          {userCredits !== null && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{userCredits} kredit</span>
            </div>
          )}
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
              {getValidationIcon()}
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
          <div className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
            userCredits !== null && userCredits < (isPremium ? 15 : 5) 
              ? "border-rose-200 bg-rose-50" 
              : "border-slate-100 bg-slate-50"
          }`}>
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

            <span className={`ml-auto text-xs font-medium ${
              userCredits !== null && userCredits < (isPremium ? 15 : 5)
                ? "text-rose-600"
                : "text-slate-500"
            }`}>
              {isPremium ? "15 kredit" : "5 kredit"}
              {userCredits !== null && userCredits < (isPremium ? 15 : 5) && " (tidak cukup)"}
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

      {/* Insufficient Credits Modal - AGR-17 */}
      <AnimatePresence>
        {showCreditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Kredit Tidak Cukup</h3>
                </div>
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Anda membutuhkan <strong>{requiredCredits} kredit</strong> untuk analisis ini, 
                tetapi saldo Anda hanya <strong>{userCredits} kredit</strong>.
              </p>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Saldo saat ini:</span>
                  <span className="font-medium text-slate-900">{userCredits} kredit</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Kredit dibutuhkan:</span>
                  <span className="font-medium text-slate-900">{requiredCredits} kredit</span>
                </div>
                <div className="border-t border-slate-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Kekurangan:</span>
                  <span className="font-medium text-rose-600">{requiredCredits - (userCredits || 0)} kredit</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <Link
                  href="/dashboard/topup"
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors text-center"
                >
                  Top-up Sekarang
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
