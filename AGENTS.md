# AGENTS.md - VidSense AI Development Guide

## 🚨 CRITICAL REMINDER: Vercel Deployment

**Setiap perubahan kode HARUS dipertimbangkan untuk deployment ke Vercel!**

### GitHub → Vercel Auto-Deploy
- Repository ini terhubung langsung ke **Vercel**
- Push ke `main` branch = **Auto-deploy ke production**
- Pull Request = **Preview deployment otomatis**

### ⚠️ Pre-Deployment Checklist (WAJIB)

Sebelum push ke GitHub, pastikan:

#### 1. Environment Variables ✅
- [ ] Semua env variables di `.env.local` sudah di-copy ke Vercel Dashboard
- [ ] Tidak ada secret yang ter-commit ke GitHub
- [ ] `DEBUG_SECRET` sudah di-set di production
- [ ] `NEXT_PUBLIC_*` variables sudah benar (client-safe)

#### 2. Database Migrations ✅
- [ ] SQL migrations sudah dijalankan di Supabase production
- [ ] Kolom `result_snapshot` sudah ada (AGR-21)
- [ ] Test query ke database berhasil

#### 3. Security Checks ✅
- [ ] Debug endpoints terproteksi (AGR-25)
- [ ] Service role keys tidak di-expose ke client
- [ ] RLS policies aktif di Supabase

#### 4. Testing ✅
- [ ] Build lokal berhasil: `npm run build`
- [ ] Tidak ada TypeScript errors
- [ ] Test analisis berhasil (minimal demo mode)

---

## 🔄 Deployment Workflow

### Scenario A: Development (Local Only)
```bash
# Edit kode di branch feature
# Test di localhost:3000
npm run dev

# Jangan push dulu jika belum siap deploy!
```

### Scenario B: Ready to Deploy
```bash
# 1. Cek status environment
vercel env ls

# 2. Jalankan build test
npm run build

# 3. Cek database migrations
# (Jalankan SQL di Supabase jika ada migration baru)

# 4. Commit dan push
 git add .
 git commit -m "feat: deskripsi perubahan"
 git push origin main

# 5. Monitor deployment di Vercel Dashboard
```

### Scenario C: Hotfix (Urgent)
```bash
# Untuk fix urgent yang harus langsung ke production
 git add .
 git commit -m "fix: urgent bug description"
 git push origin main

# Monitor di Vercel Dashboard → Deployments
```

---

## 🗄️ Database Migration Management

### File Migrations (di `supabase/migrations/`)
```
supabase/migrations/
├── analysis_history_result_snapshot.sql     ✅ AGR-21
├── ensure_users_profile_on_auth_signup.sql  ✅ User setup
├── ensure_transactions_columns_for_topup.sql ✅ Payment
├── add_admin_features.sql                    ✅ Admin panel
└── ... (lainnya)
```

### Procedure Migration

**Step 1: Local Development**
```sql
-- Test migration di Supabase local/staging dulu
-- Cek apakah berhasil tanpa error
```

**Step 2: Before Deploy**
```sql
-- Jalankan migration di Supabase PRODUCTION
-- Buka Supabase Dashboard → SQL Editor
-- Copy-paste isi file .sql dan run
```

**Step 3: Verify**
```sql
-- Cek apakah migration berhasil
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'analysis_history';
-- Harus ada: result_snapshot
```

**Step 4: Deploy Code**
```bash
# Push kode yang menggunakan kolom baru
 git push origin main
```

---

## 🔐 Environment Variable Management

### Server-Only Variables (🔒 JANGAN pakai NEXT_PUBLIC_)
```
SUPABASE_SERVICE_ROLE_KEY    # Database admin access
YOUTUBE_API_KEY              # YouTube API
OPENROUTER_API_KEY           # AI insights
HUGGINGFACE_API_TOKEN        # Sentiment analysis
DEBUG_SECRET                 # Debug endpoint protection
LINEAR_API_KEY               # Project management
```

### Client-Safe Variables (✅ Boleh pakai NEXT_PUBLIC_)
```
NEXT_PUBLIC_SUPABASE_URL     # Supabase endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY # Public API key
NEXT_PUBLIC_SITE_URL         # Website URL
```

### Vercel Environment Setup

**Cara 1: CLI**
```bash
# Add environment variable
vercel env add VARIABLE_NAME production

# List all variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME production
```

**Cara 2: Dashboard**
1. Buka https://vercel.com/dashboard
2. Pilih project VidSense AI
3. Settings → Environment Variables
4. Add new variable

---

## 🧪 Testing Before Deploy

### Local Build Test
```bash
# Build production locally
npm run build

# Start production server locally
npm start

# Test di http://localhost:3000
```

### Critical Paths to Test
- [ ] Homepage loads tanpa error
- [ ] Analisis video berhasil (demo mode OK)
- [ ] History tersimpan dan bisa di-load
- [ ] Tidak ada 500 errors di console
- [ ] Debug endpoints terproteksi (test dengan/without secret)

### Database Connection Test
```bash
# Test Supabase connection
curl -H "x-debug-secret: YOUR_SECRET" \
  https://your-domain.com/api/debug/supabase
```

---

## 📊 Monitoring Deployment

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Cek: Build logs, Runtime logs, Analytics

### Supabase Dashboard
- URL: https://app.supabase.com
- Cek: Database logs, Auth logs, API usage

### Linear (Project Tracking)
- URL: https://linear.app/agriantech
- Update status issue setelah deploy

---

## 🆘 Troubleshooting Deployment

### Build Failed
```
Error: Command "npm run build" exited with 1
```
**Solution:**
1. Cek error log di Vercel Dashboard
2. Fix error di local
3. Push ulang

### Runtime Error (500)
```
Error: Missing environment variable
```
**Solution:**
1. Cek Vercel env vars lengkap
2. Bandingkan dengan `.env.example`
3. Add missing variables

### Database Error
```
Error: column "result_snapshot" does not exist
```
**Solution:**
1. Migration belum dijalankan
2. Jalankan SQL di Supabase
3. Redeploy

### Debug Endpoint Exposed
```
Error: Debug endpoints should be protected
```
**Solution:**
1. Pastikan `DEBUG_SECRET` di-set
2. Cek kode proteksi sudah ada
3. Test dengan curl

---

## 📝 Commit Message Convention

### Format
```
<type>: <description>

[optional body]
```

### Types
- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Dokumentasi
- `security:` - Security fix
- `refactor:` - Refactoring kode
- `test:` - Testing

### Examples
```bash
 git commit -m "feat: add AI insight generation"
 git commit -m "fix: resolve YouTube API quota error"
 git commit -m "security: protect debug endpoints in production"
 git commit -m "docs: update deployment checklist"
```

---

## 🎯 Current Status: ALL PHASES COMPLETE ✅

### 🎉 PROJECT 100% COMPLETE

**All 23 functional issues have been implemented and deployed!**

---

### Implemented & Deployed:

#### ✅ Fase 1 - Foundation (3 issues)
- ✅ AGR-25: Debug endpoint protection
- ✅ AGR-21: result_snapshot migration  
- ✅ AGR-22: Environment checklist

#### ✅ Fase 2 - Core Features (4 issues)
- ✅ AGR-6: E2E testing Basic - Alur analisis dari dashboard ke hasil lengkap
- ✅ AGR-7: E2E testing Premium - AI Insight generation dengan OpenRouter
- ✅ AGR-14: Top-up payment - WhatsApp GoPay integration
- ✅ AGR-26: Error handling - Retry mechanism untuk YouTube, HuggingFace, OpenRouter

#### ✅ Fase 3 - Admin & Polish (3 issues)
- ✅ AGR-23: Admin users management - approve, kredit, suspend, delete
- ✅ AGR-24: Admin transaksi & rekonsiliasi - verify, approve, reject
- ✅ AGR-27: Legal pages - Syarat & Ketentuan, Kebijakan Privasi

#### ✅ Fase 4 - History & Account (12 issues)
- ✅ AGR-8: Riwayat pagination dan filter premium/basic
- ✅ AGR-9: Riwayat detail dengan snapshot penuh
- ✅ AGR-10: UX entri tanpa snapshot
- ✅ AGR-11: UI jelaskan sampel komentar vs total
- ✅ AGR-12: Word cloud edge case data tipis
- ✅ AGR-13: Demo mode vs produksi pesan konsisten
- ✅ AGR-15: Callback top-up saldo dan transaksi
- ✅ AGR-16: Session saldo kredit sinkron dengan DB
- ✅ AGR-17: Analisis ditolak saldo tidak cukup (better UX)
- ✅ AGR-18: Profil & pengaturan akun
- ✅ AGR-19: Hapus akun alur & privasi
- ✅ AGR-20: Akun ditangguhkan /suspended

---

### 📊 Linear Status Summary
- **Done: 23 issues** ✅
- **In Progress: 0 issues**
- **Backlog: 0 issues**
- **Todo: 4 issues** (Linear setup examples - not functional)

---

### 🚀 Deployment Status
- **GitHub:** ✅ All commits pushed
- **Vercel:** ✅ Auto-deploy active
- **Build:** ✅ Successful (no TypeScript errors)
- **Last Deploy:** Commit `0cb7146`

---

### 📝 Summary of All Features

**Core Analysis:**
- YouTube video sentiment analysis
- Basic (5 credits) & Premium (15 credits) modes
- AI Insight generation with OpenRouter
- Word cloud generation
- Sample comment display (100 from total)

**History & Data:**
- Server-side pagination (10 items per page)
- Filter by type (Basic/Premium)
- Search by video title/URL
- Full snapshot detail view
- Handle entries without snapshot gracefully

**Payment & Credits:**
- Top-up via WhatsApp GoPay
- Automatic credit addition via webhook callback
- Real-time credit sync (30s polling + visibility API)
- Insufficient credit modal with quick top-up

**Admin Panel:**
- User management (approve, suspend, credit adjustment, delete)
- Transaction verification & reconciliation
- Activity logs

**Account Management:**
- Profile page with stats
- Settings (notifications, account tier)
- Delete account with confirmation
- Suspended account page

**Legal & UX:**
- Terms & Conditions page
- Privacy Policy page
- Demo mode consistent messaging
- Error handling with retry mechanism
- Sample vs total explanation

---

**Last Updated:** April 2026  
**Project:** VidSense AI - YouTube Sentiment Analysis SaaS  
**Status:** ✅ **100% COMPLETE - ALL ISSUES DONE**  
**Deployment:** Vercel + Supabase + GitHub

**⚠️ REMEMBER: Every code change affects production! Test locally first! ⚠️**

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Build test
npm run build

# Deploy
vercel --prod

# Check env
vercel env ls

# View logs
vercel logs

# Open dashboard
vercel
```

---

## 📋 Linear Project Management Automation

### Setup
Pastikan `LINEAR_API_KEY` sudah di-set di `.env.local`:
```bash
LINEAR_API_KEY=lin_api_your_key_here
```

### Available Commands

#### 1. List Semua Issue
```bash
npm run linear:update -- --list
# atau
npm run linear:update -- -l
```
Output menampilkan semua issue yang dikelompokkan berdasarkan status (Backlog, In Progress, Done, dll).

#### 2. Update Status Single Issue
```bash
# Update ke Done
npm run linear:update -- --status-done AGR-25

# Update ke In Progress
npm run linear:update -- --status-progress AGR-6

# Update ke Backlog
npm run linear:update -- --status-backlog AGR-6
```

#### 3. Batch Update Multiple Issue
```bash
# Update multiple issue ke Done sekaligus
npm run linear:update -- --batch-done AGR-21,AGR-22,AGR-25
```

#### 4. Tambah Komentar ke Issue
```bash
npm run linear:update -- --comment AGR-25 "Fix sudah di-deploy ke production"
```

#### 5. Help
```bash
npm run linear:update -- --help
```

### Workflow Penggunaan

**Setelah menyelesaikan coding:**
```bash
# 1. Update status issue ke Done
npm run linear:update -- --status-done AGR-6

# 2. Tambah komentar progress
npm run linear:update -- --comment AGR-6 "E2E testing selesai, semua test pass"

# 3. Verifikasi di Linear
npm run linear:update -- --list
```

**Batch update setelah Fase selesai:**
```bash
# Update semua issue Fase 1 ke Done
npm run linear:update -- --batch-done AGR-21,AGR-22,AGR-25
```

### Tips
- Gunakan `--list` untuk cek status issue sebelum update
- Selalu tambahkan komentar saat update status untuk dokumentasi
- Batch update menghemat waktu untuk multiple issue
- Issue identifier (AGR-XX) bisa dilihat di Linear atau dari output `--list`

---

**Last Updated:** April 2026  
**Project:** VidSense AI - YouTube Sentiment Analysis SaaS  
**Deployment:** Vercel + Supabase + GitHub  
**Status:** Fase 1 Complete, Ready for Fase 2

**⚠️ REMEMBER: Every code change affects production! Test locally first! ⚠️**
