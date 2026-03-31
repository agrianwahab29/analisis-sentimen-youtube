"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError, emailConfirmationRequired } = await signUp(
        email,
        password,
        name
      );

      if (signUpError) throw new Error(signUpError);

      if (emailConfirmationRequired) {
        setSuccess(true);
      } else {
        window.location.href = "/dashboard/main";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setError(message || "Gagal mendaftar. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Register Card */}
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
              Buat Akun Baru
            </h1>
            <p className="text-slate-500">
              Daftar untuk mulai menganalisis sentimen komentar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">
                  Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi sebelum masuk.
                </p>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Minimal 8 karakter dengan huruf dan angka
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                Saya setuju dengan{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Syarat dan Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Kebijakan Privasi
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
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
                  Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">sudah punya akun?</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600">
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Masuk ke akun Anda
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
