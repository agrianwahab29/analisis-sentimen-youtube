"use client";

import { motion } from "framer-motion";

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-slate-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="mt-4 h-2 w-full bg-slate-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 h-80">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="flex items-center justify-center h-48">
            <div className="h-32 w-32 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 h-80">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Analysis Input Skeleton
export function AnalysisInputSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
        <div>
          <div className="h-5 w-48 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="h-2 w-full bg-slate-200 rounded-full animate-pulse" />
        </div>
      ))}
    </>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-12 w-16 bg-slate-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-full bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress Indicator untuk Analysis
export function AnalysisProgress({ 
  progress, 
  message 
}: { 
  progress: number; 
  message: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-16 h-16 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
          Menganalisis Sentimen
        </h3>

        <p className="text-slate-500 text-center mb-6">{message}</p>

        <div className="relative">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{progress}%</span>
            <span>{progress === 100 ? "Selesai!" : "Mohon tunggu..."}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 justify-center text-sm text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Powered by HuggingFace IndoBERT</span>
        </div>
      </div>
    </motion.div>
  );
}

// Button Loading State
export function ButtonLoading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {children}
    </>
  );
}

// Page Transition
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
