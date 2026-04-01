"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const { user, loading, signInWithGoogle } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get("redirect") || "/dashboard/main";
      window.location.href = redirectTo;
    }
  }, [user, loading, searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // signInWithGoogle will redirect, so no need for manual redirect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      console.error("Google sign-in error:", message);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white font-heading">
                VidSense
              </span>
              <span className="text-sm text-slate-400">AI</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 font-heading mb-2">
              Selamat Datang Kembali
            </h1>
            <p className="text-slate-500">
              Masuk untuk menganalisis sentimen komentar YouTube
            </p>
          </div>

          <div className="space-y-5">
            {/* Google Sign In Button */}
            <form action="/auth/google" method="GET">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
              >
                <img src="/google.svg" alt="Google" className="h-5 w-5" />
                Masuk dengan Google
              </button>
            </form>

            {/* Info text */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-blue-700 text-center">
                Saat ini hanya tersedia login dengan Google. 
                Daftar sekarang dan mulai analisis sentimen YouTube gratis!
              </p>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Belum punya akun?{" "}
            <a
              href="https://accounts.google.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Daftar dengan Google di sini
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
