# 🔧 VERCEL DEPLOYMENT CHECKLIST

## Environment Variables yang HARUS di-set di Vercel Dashboard

Masuk ke **Project Settings > Environment Variables** dan tambahkan:

### 1. Supabase (WAJIB)
```
NEXT_PUBLIC_SUPABASE_URL=(dari .env.local Anda)
NEXT_PUBLIC_SUPABASE_ANON_KEY=(dari .env.local Anda)
SUPABASE_SERVICE_ROLE_KEY=(dari .env.local Anda)
```

### 2. YouTube API (WAJIB untuk komentar)
```
YOUTUBE_API_KEY=(dari .env.local Anda)
```
**Pastikan API Key aktif dan Quota masih tersedia di Google Cloud Console**

### 3. OpenRouter (untuk AI Insight)
```
OPENROUTER_API_KEY=(dari .env.local Anda)
OPENROUTER_MODEL=qwen/qwen3.6-plus-preview:free
```

### 4. HuggingFace (untuk analisis sentimen)
```
HUGGINGFACE_API_TOKEN=(dari .env.local Anda)
```

## Cara Cek Environment Variables

1. Buka terminal lokal:
```bash
vercel env ls
```

2. Atau masuk ke Vercel Dashboard > Project > Settings > Environment Variables

## Redeploy setelah set Environment Variables

```bash
vercel --prod
```

Atau trigger redeploy dari Vercel Dashboard

## Troubleshooting API Key YouTube

Jika komentar masih 0:
1. Cek API Key aktif di: https://console.cloud.google.com/apis/credentials
2. Pastikan "YouTube Data API v3" ENABLE
3. Cek quota usage: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
4. Pastikan tidak ada IP restrictions yang memblok Vercel

## Troubleshooting Auth 500 Error

1. Cek Supabase URL dan Anon Key benar
2. Pastikan Database tables sudah dibuat (users, analysis_history)
3. Cek RLS policies di Supabase:
   - users table: Enable RLS, add policy untuk authenticated users
   - analysis_history table: Enable RLS, add policy untuk authenticated users

## Database Schema yang Diperlukan

### Table: users
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  credit_balance integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table users enable row level security;

-- Policy
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Table: analysis_history  
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
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table analysis_history enable row level security;

-- Policy
CREATE POLICY "Users can view own history" ON analysis_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
