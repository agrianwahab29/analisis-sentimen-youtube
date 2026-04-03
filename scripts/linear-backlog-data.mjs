/** Backlog starter — impor ke Linear via `node scripts/seed-linear-issues.mjs` */

export const PROJECT_NAMES = {
  produk: "Produk & analisis",
  monetisasi: "Monetisasi & akun",
  platform: "Platform & operasi",
};

export const ISSUES = [
  {
    projectKey: "produk",
    title: "Uji E2E: alur analisis Basic dari dashboard utama",
    description: `## Konteks
Memastikan pengguna login bisa menganalisis video basic tanpa error.

## Acceptance criteria
- [ ] Dari /dashboard/main, submit URL valid → halaman analisis terbuka (basic)
- [ ] Statistik + tab komentar tampil
- [ ] Kredit berkurang sesuai aturan basic
- [ ] Tidak ada 500 di /api/analyze pada skenario normal`,
  },
  {
    projectKey: "produk",
    title: "Uji E2E: alur analisis Premium (AI Insight)",
    description: `## Konteks
Verifikasi premium termasuk OpenRouter dan riwayat.

## Acceptance criteria
- [ ] Analisis premium selesai saat OPENROUTER_API_KEY tersedia
- [ ] AI Insight teks polos (tanpa tag HTML mentah)
- [ ] Biaya kredit premium konsisten UI vs backend`,
  },
  {
    projectKey: "produk",
    title: "Riwayat: pagination dan filter premium/basic",
    description: `## Konteks
/dashboard/history dan GET /api/history.

## Acceptance criteria
- [ ] Filter Semua/Premium/Basic benar
- [ ] Pagination konsisten
- [ ] Hanya data milik user login`,
  },
  {
    projectKey: "produk",
    title: "Riwayat: detail dengan snapshot penuh",
    description: `## Konteks
/dashboard/history/[id] + kolom result_snapshot.

## Acceptance criteria
- [ ] Entri baru: layout setara analisis live
- [ ] GET /api/history/[id] 404 untuk id orang lain
- [ ] Export JSON tidak error`,
  },
  {
    projectKey: "produk",
    title: "Riwayat: UX entri tanpa snapshot",
    description: `## Konteks
Baris lama tanpa result_snapshot.

## Acceptance criteria
- [ ] Pesan jelas untuk pengguna awam
- [ ] Analisis ulang membawa URL + flag premium benar
- [ ] Tidak blank/crash`,
  },
  {
    projectKey: "produk",
    title: "UI: jelaskan sampel komentar vs total",
    description: `## Konteks
Badge/tab komentar vs total dianalisis.

## Acceptance criteria
- [ ] Teks bantuan singkat di UI
- [ ] Angka konsisten dengan API`,
  },
  {
    projectKey: "produk",
    title: "Word cloud & grafik: edge case data tipis",
    description: `## Konteks
Sedikit/ nol komentar atau teks kosong.

## Acceptance criteria
- [ ] Tidak crash; fallback ramah
- [ ] Chart atau pesan "tidak ada data" sesuai aturan produk`,
  },
  {
    projectKey: "produk",
    title: "Demo mode vs produksi — pesan konsisten",
    description: `## Konteks
Tanpa YOUTUBE_API_KEY atau skenario demo.

## Acceptance criteria
- [ ] Banner/pesan demo jelas
- [ ] Pengguna tidak mengira hasil = data live`,
  },
  {
    projectKey: "monetisasi",
    title: "Top-up: generate pembayaran + tampilan status",
    description: `## Konteks
/dashboard/topup + /api/topup/generate.

## Acceptance criteria
- [ ] Generate sukses → UI menampilkan instruksi
- [ ] Error gateway: pesan ID
- [ ] Tidak bocor secret di response`,
  },
  {
    projectKey: "monetisasi",
    title: "Callback top-up: saldo dan transaksi",
    description: `## Konteks
/api/topup/callback.

## Acceptance criteria
- [ ] Saldo naik sesuai paket
- [ ] Idempotent jika didesain begitu
- [ ] GET /api/me/transactions konsisten`,
  },
  {
    projectKey: "monetisasi",
    title: "Session: saldo kredit sinkron dengan DB",
    description: `## Konteks
/api/auth/session + tabel users.

## Acceptance criteria
- [ ] Setelah top-up, refresh menampilkan saldo baru
- [ ] Edge profil belum ada tidak merusak UX`,
  },
  {
    projectKey: "monetisasi",
    title: "Analisis ditolak: saldo tidak cukup",
    description: `## Konteks
POST /api/analyze saat kredit habis.

## Acceptance criteria
- [ ] Status & body error konsisten
- [ ] UI: CTA top-up atau kembali
- [ ] Tidak potong kredit jika gagal`,
  },
  {
    projectKey: "monetisasi",
    title: "Profil & pengaturan akun",
    description: `## Konteks
/dashboard/profile, /dashboard/settings, /api/user/settings.

## Acceptance criteria
- [ ] Simpan & reload bertahan
- [ ] Validasi input dasar
- [ ] Error API tampil ke user`,
  },
  {
    projectKey: "monetisasi",
    title: "Hapus akun — alur & privasi",
    description: `## Konteks
/api/user/delete-account + /legal/privacy.

## Acceptance criteria
- [ ] Konfirmasi UI
- [ ] Sesi/data sesuai kebijakan
- [ ] Teks legal selaras`,
  },
  {
    projectKey: "monetisasi",
    title: "Akun ditangguhkan — /suspended",
    description: `## Konteks
User suspend + admin.

## Acceptance criteria
- [ ] Suspended tidak akses dashboard utama
- [ ] Proses unsuspend terdokumentasi`,
  },
  {
    projectKey: "platform",
    title: "Supabase prod: kolom result_snapshot",
    description: `## Konteks
Migrasi analysis_history.result_snapshot.

## Acceptance criteria
- [ ] SQL dijalankan di production
- [ ] Insert analisis baru tidak gagal
- [ ] Catat rollback singkat di komentar issue`,
  },
  {
    projectKey: "platform",
    title: "Checklist env Vercel untuk rilis",
    description: `## Konteks
Supabase, YouTube, HF/OpenRouter, callback top-up, URL publik.

## Acceptance criteria
- [ ] Daftar env + fungsi (internal)
- [ ] Preview tidak expose secret`,
  },
  {
    projectKey: "platform",
    title: "Admin: users — approve, kredit, suspend",
    description: `## Konteks
/admin/users + /api/admin/users/**.

## Acceptance criteria
- [ ] Hanya admin
- [ ] Perubahan tercermin di DB
- [ ] Audit minimal`,
  },
  {
    projectKey: "platform",
    title: "Admin: transaksi & rekonsiliasi",
    description: `## Konteks
/admin/transactions.

## Acceptance criteria
- [ ] Filter untuk transaksi bermasalah
- [ ] Tipe & nominal konsisten schema`,
  },
  {
    projectKey: "platform",
    title: "Amankan /api/debug di production",
    description: `## Konteks
/api/debug/*.

## Acceptance criteria
- [ ] Prod tidak membocorkan data sensitif
- [ ] Non-prod only atau gate secret`,
  },
  {
    projectKey: "platform",
    title: "Error hulu: YouTube, model sentimen, OpenRouter",
    description: `## Konteks
Quota, timeout, rate limit.

## Acceptance criteria
- [ ] Pesan ID bermakna untuk user
- [ ] Log memadai untuk debug`,
  },
  {
    projectKey: "platform",
    title: "Legal: Syarat & Privasi vs fitur aktual",
    description: `## Konteks
/legal/terms, /legal/privacy.

## Acceptance criteria
- [ ] Selaras kredit, riwayat, AI, hapus akun
- [ ] Perbarui tanggal revisi jika diubah`,
  },
];
