import Link from "next/link";
import { Sparkles, Play, BarChart3, Zap, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 font-heading">
              VidSense <span className="text-slate-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/auth/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Masuk
            </a>
            <Link
              href="/auth/login"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-20 pb-32">
        {/* Subtle gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                <Zap className="h-3 w-3" fill="currentColor" />
                AI-Powered Sentiment Analysis
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-heading leading-tight">
                Analisis Sentimen YouTube dengan{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Akurasi 94.52%
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Pahami apa yang subscriber Anda rasakan terhadap konten Anda dalam hitungan menit. 
                Tidak perlu membaca ribuan komentar satu per satu — biarkan AI yang mengerjakannya.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Mulai Gratis
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-medium text-slate-700 transition-all hover:bg-slate-50"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>

              <p className="text-sm text-slate-500">
                Dapatkan 10 kredit gratis untuk mencoba. Tidak perlu kartu kredit.
              </p>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                {/* Mock UI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <Play className="h-5 w-5 text-red-600" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Tutorial Bahasa Indonesia</p>
                      <p className="text-xs text-slate-500">12rb views • 2 jam yang lalu</p>
                    </div>
                  </div>

                  {/* Sentiment Results */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Sentimen</span>
                      <span className="text-sm text-slate-500">1,247 komentar</span>
                    </div>

                    {/* Positive bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Positif
                        </span>
                        <span className="font-medium text-emerald-700">62%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: "62%" }} />
                      </div>
                    </div>

                    {/* Negative bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-rose-600">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Negatif
                        </span>
                        <span className="font-medium text-rose-700">18%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-rose-500" style={{ width: "18%" }} />
                      </div>
                    </div>

                    {/* Neutral bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          Netral
                        </span>
                        <span className="font-medium text-slate-600">20%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-400" style={{ width: "20%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <strong>AI Insight:</strong> Secara keseluruhan video ini diterima baik oleh viewer Indonesia. 
                    Komentar positif fokus pada kualitas penjelasan yang mudah dipahami.
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                94.52% Akurasi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
              Cara Kerja
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tiga langkah sederhana untuk memahami sentimen komentar YouTube Anda
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </div>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Play className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Paste URL Video</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Salin link video YouTube yang ingin Anda analisis dan tempelkan di kolom input.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </div>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Zap className="h-7 w-7 text-blue-600" fill="currentColor" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Menganalisis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sistem secara otomatis mengambil dan menganalisis semua komentar menggunakan model IndoBERT.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                3
              </div>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <BarChart3 className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Dapatkan Insights</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Lihat hasil analisis dalam visualisasi yang mudah dipahami — positif, negatif, dan netral.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 font-heading mb-2">94.52%</div>
              <div className="text-sm text-slate-600">Akurasi Model</div>
              <div className="text-xs text-slate-400 mt-1">IndoBERT Fine-tuned</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 font-heading mb-2">1000+</div>
              <div className="text-sm text-slate-600">Komentar</div>
              <div className="text-xs text-slate-400 mt-1">per analisis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 font-heading mb-2">&lt;30s</div>
              <div className="text-sm text-slate-600">Waktu Analisis</div>
              <div className="text-xs text-slate-400 mt-1">untuk hasil lengkap</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 font-heading mb-2">10</div>
              <div className="text-sm text-slate-600">Kredit Gratis</div>
              <div className="text-xs text-slate-400 mt-1">tanpa kartu kredit</div>
            </div>
          </div>

          {/* Accuracy citation */}
          <div className="mt-10 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-center">
            <p className="text-sm text-blue-800">
              <strong>Referensi Akurasi:</strong> Model IndoBERT fine-tuned untuk sentimen Indonesia mencapai{" "}
              <strong>94.52% accuracy</strong> dan <strong>94.51% F1-score</strong> pada benchmark standar.{" "}
              <a 
                href="https://huggingface.co/crypter70/indobert-sentiment-analysis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Lihat di HuggingFace →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dirancang untuk membantu kreator konten dan marketer memahami audiens mereka
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Zap className="h-6 w-6 text-white" fill="currentColor" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">AI-Powered</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Menggunakan model IndoBERT yang sudah dilatih khusus untuk bahasa Indonesia dan sentimen analysis.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Visual Reports</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hasil analisis ditampilkan dalam chart yang mudah dipahami — pie chart dan summary statistics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Credit System</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                10 kredit gratis untuk coba. Top-up sesuai kebutuhan. Tidak ada biaya tersembunyi.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dapatkan ringkasan otomatis dan insights mendalam dari komentar YouTube menggunakan LLM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
              Teknologi yang Digunakan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with best-in-class AI and cloud infrastructure
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm-.5 2.5L12 5l.5 2.5L12 10.5 11.5 8 12 5zm-5.5 5.5l4.5 2.5v4.5L2 15.5v-5zm11 0v5l-4.5 2.5v-4.5l4.5-2.5z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">HuggingFace</h3>
              </div>
              <p className="text-sm text-slate-600">
                IndoBERT fine-tuned model untuk analisis sentimen bahasa Indonesia dengan akurasi 94.52%.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">YouTube API</h3>
              </div>
              <p className="text-sm text-slate-600">
                YouTube Data API v3 untuk mengambil komentar video secara real-time dan komprehensif.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white font-heading mb-4">
            Siap Memahami Audiens Anda?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Mulai analisis sentimen YouTube hari ini. 10 kredit gratis untuk mencoba — 
            tidak perlu kartu kredit.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 hover:scale-105"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-slate-900 font-heading">
                VidSense <span className="text-slate-500">AI</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/legal/terms" className="hover:text-slate-700 transition-colors">
                Syarat dan Ketentuan
              </Link>
              <Link href="/legal/privacy" className="hover:text-slate-700 transition-colors">
                Kebijakan Privasi
              </Link>
            </div>

            <p className="text-sm text-slate-400">
              © 2026 VidSense AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
