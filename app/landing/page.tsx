import Link from "next/link";
import {
  Sparkles,
  Play,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  MessageSquare,
  Brain,
  Eye,
  TrendingUp,
  Users,
  Search,
  Clock,
  CheckCircle2,
  Star,
  ChevronRight,
  Activity,
  PieChart,
  FileText,
  Lightbulb,
  Target,
  Layers,
  Globe,
  Cpu,
  Database,
  MonitorPlay,
} from "lucide-react";

/* ─────────────────────────────────────────────
   LANDING PAGE — "Industrial-Editorial Data Intelligence"
   Server Component · No hooks · CSS-only animations
   ───────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          1. NAVIGATION
          ═══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-heading tracking-tight">
              VidSense <span className="text-slate-400">AI</span>
            </span>
          </div>
          <Link
            href="/auth/google"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
          >
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          2. HERO SECTION — Dark #0B1120
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36">
        {/* Gradient mesh background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[1200px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
          <div className="absolute top-32 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-blue-900/[0.1] blur-[80px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-16 items-center">
            {/* ─── Left: Text ─── */}
            <div className="space-y-8 animate-fade-in">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
                <Zap className="h-3.5 w-3.5" fill="currentColor" />
                AI-Powered Sentiment Analysis
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem] leading-[1.1] font-heading">
                Analisis Sentimen YouTube dengan Akurasi{" "}
                <span
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  style={{
                    textShadow:
                      "0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(6,182,212,0.2)",
                  }}
                >
                  94.52%
                </span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                Pahami apa yang audiens Anda rasakan terhadap konten Anda. Tidak
                perlu membaca ribuan komentar — biarkan AI yang mengerjakannya.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/google"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                  style={{
                    boxShadow:
                      "0 0 24px rgba(59,130,246,0.3), 0 4px 14px rgba(0,0,0,0.2)",
                  }}
                >
                  Mulai Gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-7 py-4 text-base font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:border-white/20"
                >
                  Lihat Demo
                </a>
              </div>

              <p className="text-sm text-slate-500">
                10 kredit gratis · Tanpa kartu kredit · Hasil dalam ~13 detik
              </p>
            </div>

            {/* ─── Right: Mock Dashboard Card ─── */}
            <div className="relative hidden lg:block" style={{ animation: "fadeIn 0.6s ease-out 0.2s both" }}>
              <div
                className="relative rounded-2xl border border-white/[0.08] bg-[#0F1A2E] p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 0 60px rgba(59,130,246,0.1), 0 0 120px rgba(6,182,212,0.05), 0 25px 50px rgba(0,0,0,0.4)",
                }}
              >
                {/* Video card header */}
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4 mb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <MonitorPlay className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      Tutorial Bahasa Indonesia Paling Lengkap
                    </p>
                    <p className="text-xs text-slate-500">
                      TechChannel · 12rb views · 2 jam lalu
                    </p>
                  </div>
                </div>

                {/* Sentiment breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Sentimen
                    </span>
                    <span className="text-xs text-slate-500">1,247 komentar</span>
                  </div>

                  {/* Horizontal bar chart */}
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: "62%" }}
                    />
                    <div
                      className="bg-rose-500 transition-all"
                      style={{ width: "18%" }}
                    />
                    <div
                      className="bg-slate-500 transition-all"
                      style={{ width: "20%" }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-400">Positif</span>
                      <span className="text-xs font-semibold text-emerald-400 ml-auto">
                        62%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-xs text-slate-400">Negatif</span>
                      <span className="text-xs font-semibold text-rose-400 ml-auto">
                        18%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-500" />
                      <span className="text-xs text-slate-400">Netral</span>
                      <span className="text-xs font-semibold text-slate-400 ml-auto">
                        20%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini word cloud */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {["bagus", "keren", "mantap", "jelek", "bermanfaat", " recommended", "tutorial", "jelas", "bingung", "top"].map(
                    (word, i) => (
                      <span
                        key={word}
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          i < 5
                            ? "bg-emerald-500/10 text-emerald-400"
                            : i < 8
                            ? "bg-slate-500/10 text-slate-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {word.trim()}
                      </span>
                    )
                  )}
                </div>

                {/* AI Insight */}
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">
                      AI Insight
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white uppercase tracking-wider">
                      Premium
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Video diterima baik. Penonton menyukai kualitas penjelasan
                    dan kejelasan materi. Keluhan minor: audio terlalu pelan di
                    menit 12-15.
                  </p>
                </div>

                {/* Corner glow overlay */}
                <div className="pointer-events-none absolute -top-px -left-px -right-px h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. TRUSTED BY / STATS BAR — Dark subtle
          ═══════════════════════════════════════════ */}
      <section className="relative border-y border-white/[0.04] bg-[#080E1C]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              {
                value: "94.52%",
                label: "Akurasi Model",
                sub: "IndoBERT Fine-tuned",
                icon: Activity,
              },
              {
                value: "1,000+",
                label: "Komentar",
                sub: "per analisis",
                icon: MessageSquare,
              },
              {
                value: "~13 detik",
                label: "Waktu Analisis",
                sub: "hasil lengkap",
                icon: Clock,
              },
              {
                value: "10",
                label: "Kredit Gratis",
                sub: "tanpa kartu kredit",
                icon: Star,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                  <stat.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-heading tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                  <div className="text-xs text-slate-600">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. "APA SAJA ISI ANALISIS?" — WHITE BENTO GRID
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-600 mb-6">
              <Layers className="h-3.5 w-3.5" />
              7 Laporan dalam 1 Analisis
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading mb-4 tracking-tight">
              Setiap Analisis Menghasilkan 7 Laporan Lengkap
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Dari 1 URL YouTube, Anda mendapatkan insight komprehensif yang
              bisa langsung ditindaklanjuti
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Sentimen Breakdown — LARGE 2x2 */}
            <div className="group relative sm:col-span-2 sm:row-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-6">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                Sentimen Breakdown
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Visualisasi lengkap distribusi sentimen — positif, negatif, dan
                netral dengan persentase akurat.
              </p>

              {/* Mock pie chart visual */}
              <div className="flex items-center gap-8">
                <div className="relative h-36 w-36 shrink-0">
                  {/* CSS pie chart via conic-gradient */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#10B981 0deg 223.2deg, #F43F5E 223.2deg 288deg, #94A3B8 288deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-4 rounded-full bg-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900 font-heading">
                      62%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-700">Positif</span>
                    <span className="text-sm font-bold text-emerald-600 ml-2">
                      62%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-slate-700">Negatif</span>
                    <span className="text-sm font-bold text-rose-600 ml-2">
                      18%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-400" />
                    <span className="text-sm text-slate-700">Netral</span>
                    <span className="text-sm font-bold text-slate-500 ml-2">
                      20%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Word Cloud — MEDIUM */}
            <div className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-6 transition-all hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                Word Cloud
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kata paling sering muncul dalam komentar, divisualisasikan
                berdasarkan frekuensi.
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {[
                  { w: "mantap", sz: "text-sm font-bold" },
                  { w: "bagus", sz: "text-xs font-semibold" },
                  { w: "keren", sz: "text-sm font-semibold" },
                  { w: "jelek", sz: "text-[10px]" },
                  { w: "bantu", sz: "text-xs" },
                  { w: "terima", sz: "text-[10px]" },
                ].map((t) => (
                  <span
                    key={t.w}
                    className={`rounded bg-blue-100/60 px-1.5 py-0.5 text-blue-700 ${t.sz}`}
                  >
                    {t.w}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. AI Insight — MEDIUM */}
            <div className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50/50 to-white p-6 transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Brain className="h-5 w-5 text-violet-600" />
                </div>
                <span className="rounded bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Premium
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                AI Insight
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ringkasan otomatis oleh LLM — keluhan utama, rekomendasi
                konten, dan saran perbaikan.
              </p>
            </div>

            {/* 4. Komentar Teranalisis — SMALL */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-4">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                Komentar Teranalisis
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                100 komentar teratas ditampilkan dengan label sentimen
                masing-masing.
              </p>
            </div>

            {/* 5. Statistik Video — SMALL */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 mb-4">
                <Play className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                Statistik Video
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Views, likes, dan total komentar langsung dari YouTube API.
              </p>
            </div>

            {/* 6. Trend & Pola — SMALL */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 mb-4">
                <TrendingUp className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                Trend &amp; Pola
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Identifikasi topik yang paling sering muncul dalam komentar
                penonton.
              </p>
            </div>

            {/* 7. Riwayat & Ekspor — SMALL */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 mb-4">
                <FileText className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                Riwayat &amp; Ekspor
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Simpan dan akses kembali hasil analisis kapan saja dari
                dashboard Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. USE CASES — Light slate bg
          ═══════════════════════════════════════════ */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading mb-4 tracking-tight">
              Siapa yang Menggunakan VidSense AI?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Dari kreator konten hingga peneliti — siapa pun yang perlu
              memahami opini audiens
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 mb-5">
                <MonitorPlay className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                Kreator Konten YouTube
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Pahami respons audiens terhadap setiap video
              </p>
              <ul className="space-y-2.5">
                {[
                  "Optimalkan judul & thumbnail berdasarkan sentimen",
                  "Identifikasi topik yang paling disukai",
                  "Tingkatkan engagement dengan respons yang tepat",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 mb-5">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                Digital Marketer
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Evaluasi sentimen kampanye dan brand mention
              </p>
              <ul className="space-y-2.5">
                {[
                  "Monitor sentimen brand real-time",
                  "Ukur efektivitas kampanye",
                  "Identifikasi influencer dengan sentimen positif",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 mb-5">
                <Search className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                Peneliti &amp; Akademisi
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Analisis sentimen skala besar untuk riset
              </p>
              <ul className="space-y-2.5">
                {[
                  "Kumpulkan data sentimen dari ribuan komentar",
                  "Identifikasi tren opini publik",
                  "Dapatkan insight otomatis dengan AI",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. BASIC vs PREMIUM — WHITE background
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading mb-4 tracking-tight">
              Pilih Paket Analisis Anda
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Dari analisis dasar hingga insight AI mendalam
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Basic */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Basic
                  </h3>
                  <p className="text-xs text-slate-500">5 kredit per analisis</p>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  "Sentimen breakdown (positif/negatif/netral)",
                  "Statistik video lengkap",
                  "100 komentar teratas dengan label",
                  "Word cloud",
                  "Riwayat analisis",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/google"
                className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
              >
                Mulai dengan Basic
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Premium */}
            <div
              className="relative rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50/60 to-white p-8 transition-all hover:shadow-xl hover:shadow-blue-500/[0.08]"
              style={{
                boxShadow: "0 0 40px rgba(59,130,246,0.08)",
              }}
            >
              {/* Premium badge */}
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-blue-500/30">
                Premium
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Premium
                  </h3>
                  <p className="text-xs text-slate-500">15 kredit per analisis</p>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  "Semua fitur Basic, PLUS:",
                  "AI Insight oleh LLM (ringkasan, keluhan, saran)",
                  "Analisis mendalam per aspek",
                  "Rekomendasi konten berdasarkan data",
                ].map((f, i) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2.5 text-sm ${
                      i === 0 ? "font-semibold text-blue-600" : "text-slate-600"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        i === 0 ? "text-blue-500" : "text-emerald-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/google"
                className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
              >
                Mulai dengan Premium
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. CARA KERJA — Light background
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading mb-4 tracking-tight">
              Cara Kerja
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Tiga langkah sederhana untuk memahami sentimen komentar YouTube Anda
            </p>
          </div>

          {/* Horizontal timeline with connector */}
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line (desktop only) */}
            <div className="pointer-events-none absolute top-14 left-[16.6%] right-[16.6%] hidden h-[2px] bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-300 md:block" />
            <div className="pointer-events-none absolute top-14 left-[16.6%] right-[16.6%] hidden h-[2px] bg-slate-200 md:block" style={{ opacity: 0.4 }} />

            {[
              {
                step: "01",
                icon: Play,
                title: "Paste URL Video",
                desc: "Salin link video YouTube yang ingin Anda analisis dan tempelkan di kolom input.",
              },
              {
                step: "02",
                icon: Zap,
                title: "AI Menganalisis",
                desc: "Sistem secara otomatis mengambil dan menganalisis semua komentar menggunakan model IndoBERT.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Dapatkan Insights",
                desc: "Lihat hasil analisis dalam visualisasi yang mudah dipahami — positif, negatif, dan netral.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {/* Step number circle */}
                <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 bg-white shadow-lg shadow-blue-500/10" />
                  <span className="relative text-lg font-bold text-blue-600 font-heading">
                    {item.step}
                  </span>
                </div>
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. TECH STACK — Dark background #0B1120
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0B1120] py-24 lg:py-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-blue-600/[0.04] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-4 tracking-tight">
              Teknologi yang Digunakan
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Built with best-in-class AI and cloud infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-3xl mx-auto">
            {[
              {
                name: "HuggingFace",
                desc: "IndoBERT fine-tuned model — 94.52% akurasi untuk sentimen Indonesia",
                icon: Cpu,
                color: "from-orange-500/20 to-orange-600/10",
                iconColor: "text-orange-400",
                border: "border-orange-500/20",
              },
              {
                name: "YouTube Data API v3",
                desc: "Pengambilan komentar dan statistik video secara real-time",
                icon: MonitorPlay,
                color: "from-red-500/20 to-red-600/10",
                iconColor: "text-red-400",
                border: "border-red-500/20",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`group rounded-xl border ${tech.border} bg-gradient-to-br ${tech.color} p-5 transition-all hover:border-opacity-50 hover:bg-opacity-200`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <tech.icon className={`h-5 w-5 ${tech.iconColor}`} />
                  <h3 className="text-sm font-semibold text-white">
                    {tech.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. CTA SECTION — Gradient blue-to-cyan
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 py-24 lg:py-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-blue-800/20 blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-4 tracking-tight">
            Siap Memahami Audiens Anda?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Mulai analisis sentimen YouTube hari ini. 10 kredit gratis, tanpa
            kartu kredit.
          </p>
          <Link
            href="/auth/google"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-10 py-4 text-base font-semibold text-blue-600 shadow-xl shadow-black/10 transition-all hover:bg-blue-50 hover:scale-[1.02]"
            style={{
              boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 0 40px rgba(255,255,255,0.1)",
            }}
          >
            Mulai Gratis Sekarang
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          10. FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-[#080E1C] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white font-heading">
                VidSense <span className="text-slate-500">AI</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link
                href="/legal/terms"
                className="hover:text-slate-300 transition-colors"
              >
                Syarat &amp; Ketentuan
              </Link>
              <Link
                href="/legal/privacy"
                className="hover:text-slate-300 transition-colors"
              >
                Kebijakan Privasi
              </Link>
            </div>

            <p className="text-sm text-slate-600">
              &copy; 2026 VidSense AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}