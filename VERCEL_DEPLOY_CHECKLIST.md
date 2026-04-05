# 🔧 VERCEL DEPLOYMENT CHECKLIST - VidSense AI

## Fase 1: Foundation ✅ (AGR-21, AGR-22, AGR-25)

### Environment Variables yang HARUS di-set di Vercel

Masuk ke **Project Settings > Environment Variables** dan tambahkan:

#### 1. Supabase (WAJIB)
```
NEXT_PUBLIC_SUPABASE_URL=(dari .env.local Anda)
NEXT_PUBLIC_SUPABASE_ANON_KEY=(dari .env.local Anda)
SUPABASE_SERVICE_ROLE_KEY=(dari .env.local Anda - SERVER ONLY)
```

#### 2. YouTube API (WAJIB untuk komentar)
```
YOUTUBE_API_KEY=(dari .env.local Anda)
```
**Pastikan API Key aktif dan Quota masih tersedia di Google Cloud Console**

#### 3. OpenRouter (untuk AI Insight Premium)
```
OPENROUTER_API_KEY=(dari .env.local Anda)
OPENROUTER_MODEL=qwen/qwen3.6-plus-preview:free
```

#### 4. HuggingFace (untuk analisis sentimen)
```
HUGGINGFACE_API_TOKEN=(dari .env.local Anda)
```

#### 5. Security & Management
```
DEBUG_SECRET=(random string untuk proteksi endpoint debug)
LINEAR_API_KEY=(opsional - untuk project management)
```

#### 6. Site URL
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 🔒 Security Checklist (AGR-25)

### Environment Variable Security
- ✅ **Server Only** (jangan expose ke client):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `YOUTUBE_API_KEY`
  - `OPENROUTER_API_KEY`
  - `HUGGINGFACE_API_TOKEN`
  - `DEBUG_SECRET`
  - `LINEAR_API_KEY`

- ✅ **Safe for Client** (NEXT_PUBLIC_*):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`

### Debug Endpoint Protection
- ✅ Endpoint `/api/debug/*` sekarang memerlukan:
  - Development: Bisa diakses langsung
  - Production: Header `x-debug-secret: YOUR_SECRET`

### Testing Debug Endpoint
```bash
# Development (langsung)
curl http://localhost:3000/api/debug/supabase

# Production (dengan secret)
curl -H "x-debug-secret: $DEBUG_SECRET" \
  https://your-domain.com/api/debug/supabase
```

---

## 🗄️ Database Migrations (AGR-21)

### Migration yang HARUS dijalankan di Supabase SQL Editor:

Jalankan dalam urutan ini:

```sql
-- 1. User profile setup
\i supabase/migrations/ensure_users_profile_on_auth_signup.sql

-- 2. Analysis history dengan result_snapshot (WAJIB untuk AGR-21)
\i supabase/migrations/analysis_history_result_snapshot.sql

-- 3. Transaction system
\i supabase/migrations/ensure_transactions_columns_for_topup.sql
\i supabase/migrations/transactions_defaults_for_topup.sql
\i supabase/migrations/fix_transactions_type_default_to_topup.sql
\i supabase/migrations/add_transactions_insert_policy.sql

-- 4. Admin features
\i supabase/migrations/add_admin_features.sql
\i supabase/migrations/add_admin_rls_policies.sql
\i supabase/migrations/rombak_total_admin_panel.sql

-- 5. Credit system
\i supabase/migrations/add_credits_to_user_function.sql

-- 6. Debug utilities
\i supabase/migrations/debug_transactions_type_check.sql
```

### Verifikasi Migration AGR-21

Cek apakah kolom `result_snapshot` sudah ada:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analysis_history' 
AND column_name = 'result_snapshot';
```

Harus menampilkan:
- column_name: result_snapshot
- data_type: jsonb

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
- [ ] Semua environment variables di-set di Vercel
- [ ] Semua database migrations dijalankan
- [ ] Debug secret di-generate dan di-set

### 2. Deploy
```bash
# Deploy ke production
vercel --prod

# Atau push ke git (auto-deploy)
git push origin main
```

### 3. Post-Deployment Testing
- [ ] Homepage loads tanpa error
- [ ] Test analisis dengan URL YouTube
- [ ] Cek history tersimpan dengan snapshot
- [ ] Test debug endpoint dengan secret
- [ ] Tidak ada error di console browser

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase credentials"
**Solution:** Cek `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "YouTube API error"
**Solution:** 
1. Cek API Key aktif: https://console.cloud.google.com/apis/credentials
2. Pastikan "YouTube Data API v3" ENABLE
3. Cek quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

### Issue: "Debug endpoints disabled"
**Solution:** Set `DEBUG_SECRET` dan gunakan header `x-debug-secret: your-secret`

### Issue: "Detail penuh belum tersimpan"
**Solution:** Jalankan migration `analysis_history_result_snapshot.sql`

---

## 📋 Database Schema

### Table: users
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  credit_balance integer default 0,
  created_at timestamp with time zone default now()
);

alter table users enable row level security;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Table: analysis_history (dengan result_snapshot)
```sql
create table analysis_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users not null,
  video_url text not null,
  video_title text,
  video_id text,
  total_comments integer,
  positive_count integer,
  negative_count integer,
  neutral_count integer,
  credits_used integer,
  is_premium boolean default false,
  result_snapshot jsonb,  -- WAJIB untuk AGR-21
  created_at timestamp with time zone default now()
);

alter table analysis_history enable row level security;
```

---

## ✅ Acceptance Criteria Fase 1

### AGR-22: Checklist env Vercel ✅
- [x] Daftar env + fungsi (internal) - Dokumentasi lengkap di `.env.example`
- [x] Preview tidak expose secret - Server-only keys tidak pakai NEXT_PUBLIC_ prefix

### AGR-21: Supabase prod: kolom result_snapshot ✅
- [x] SQL migration tersedia (`analysis_history_result_snapshot.sql`)
- [x] Kode sudah menggunakan result_snapshot (analyze & history API)
- [x] Rollback documented (drop column if needed)

### AGR-25: Amankan /api/debug di production ✅
- [x] Prod tidak membocorkan data sensitif - Debug endpoints protected
- [x] Non-prod only atau gate secret - DEBUG_SECRET required in production

---

**Last Updated:** April 2026  
**Status:** Fase 1 Complete ✅  
**Next:** Fase 2 (Core Features)

