# Auth Protection Fix - Bugfix Design

## Overview

Aplikasi VidSense AI memiliki dua bug autentikasi yang saling terkait. Pertama, middleware hanya memeriksa keberadaan cookie `auth-token` tanpa memvalidasi sesi secara server-side, sehingga rute `/dashboard/*` bisa diakses dengan cookie palsu atau kedaluwarsa. Kedua, tombol logout ("Keluar") di `UserNav` dan `Sidebar` tidak memiliki handler, dan fungsi `signOut()` di hook `useAuth` tidak melakukan redirect setelah logout berhasil.

Strategi perbaikan: (1) Gunakan `@supabase/ssr` untuk membuat server-side Supabase client di middleware dan validasi sesi dengan `supabase.auth.getUser()`, (2) Hubungkan tombol "Keluar" ke fungsi `signOut()`, dan (3) Tambahkan redirect ke `/auth/login` setelah `signOut()` berhasil.

## Glossary

- **Bug_Condition (C)**: Kondisi yang memicu bug — akses dashboard tanpa sesi valid, atau klik tombol logout tanpa efek
- **Property (P)**: Perilaku yang diharapkan — middleware memvalidasi sesi server-side dan redirect jika tidak valid; tombol logout memanggil `signOut()` dan redirect ke `/auth/login`
- **Preservation**: Perilaku yang harus tetap sama — akses dashboard dengan sesi valid, akses rute publik, login/register flow
- **middleware.ts**: Middleware Next.js di root project yang mengecek autentikasi untuk rute `/dashboard/*`
- **useAuth hook**: Hook di `hooks/use-auth.tsx` yang menyediakan `signIn`, `signUp`, `signOut` via React Context
- **@supabase/ssr**: Package Supabase untuk server-side rendering yang mendukung cookie-based auth di middleware/server components

## Bug Details

### Bug Condition

Bug ini terdiri dari dua kondisi terpisah:

**Bug 1 - Dashboard tanpa sesi valid**: Middleware di `middleware.ts` hanya memeriksa `cookie.name.includes("auth-token")` tanpa memvalidasi apakah sesi tersebut masih aktif di Supabase. User dengan cookie kedaluwarsa atau palsu tetap bisa mengakses dashboard.

**Bug 2 - Logout tidak berfungsi**: Tombol "Keluar" di `UserNav` dan `Sidebar` tidak memiliki `onClick` handler. Selain itu, fungsi `signOut()` di `useAuth` hook tidak melakukan redirect setelah logout.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { type: "navigation" | "logout", path?: string, hasValidSession?: boolean, component?: string }
  OUTPUT: boolean

  IF input.type == "navigation" THEN
    RETURN input.path STARTS_WITH "/dashboard"
           AND NOT input.hasValidSession
           AND cookieExists("auth-token")
  END IF

  IF input.type == "logout" THEN
    RETURN input.component IN ["UserNav", "Sidebar"]
           AND userClicksLogoutButton()
  END IF

  RETURN false
END FUNCTION
```

### Examples

- User navigasi ke `/dashboard/main` tanpa login tapi ada cookie `sb-xxx-auth-token` kedaluwarsa → **Aktual**: halaman dashboard ditampilkan. **Diharapkan**: redirect ke `/auth/login?redirect=/dashboard/main`
- User navigasi ke `/dashboard/analysis` dengan cookie palsu (bukan dari Supabase) → **Aktual**: halaman ditampilkan. **Diharapkan**: redirect ke `/auth/login?redirect=/dashboard/analysis`
- User klik tombol "Keluar" di dropdown `UserNav` → **Aktual**: tidak terjadi apa-apa. **Diharapkan**: sesi dihapus, redirect ke `/auth/login`
- User klik area user di bottom `Sidebar` → **Aktual**: tidak terjadi apa-apa. **Diharapkan**: sesi dihapus, redirect ke `/auth/login`
- User memanggil `signOut()` dari hook → **Aktual**: sesi dihapus tapi tetap di halaman yang sama. **Diharapkan**: redirect ke `/auth/login`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- User dengan sesi Supabase yang valid harus tetap bisa mengakses semua rute `/dashboard/*` tanpa redirect
- Rute publik (`/`, `/auth/login`, `/auth/register`, `/auth/callback`) harus tetap bisa diakses tanpa autentikasi
- Flow login via email/password dan Google OAuth harus tetap berfungsi dan redirect ke dashboard setelah berhasil
- User yang sudah login dan mengakses `/auth/login` harus tetap di-redirect ke dashboard
- Semua fungsionalitas dashboard (analisis, top up, riwayat) harus tetap berfungsi untuk user yang terautentikasi

**Scope:**
Semua input yang TIDAK melibatkan: (1) navigasi ke rute protected tanpa sesi valid, atau (2) klik tombol logout — harus sepenuhnya tidak terpengaruh oleh perbaikan ini. Termasuk:
- Navigasi ke rute publik
- Navigasi ke dashboard dengan sesi valid
- Interaksi UI lainnya (klik tombol analisis, navigasi sidebar, dll.)
- API calls dari dashboard

## Hypothesized Root Cause

Berdasarkan analisis kode, root cause yang teridentifikasi:

1. **Middleware hanya cek cookie existence (Bug 1)**: `middleware.ts` baris 20-22 menggunakan `allCookies.some(cookie => cookie.name.includes("auth-token"))` yang hanya memeriksa apakah cookie ada, bukan apakah sesi valid. Tidak ada panggilan ke Supabase API untuk validasi server-side.

2. **Tidak ada server-side Supabase client (Bug 1)**: File `lib/supabase/client.ts` hanya membuat browser client dengan `createClient` dari `@supabase/supabase-js`. Middleware membutuhkan server-side client dari `@supabase/ssr` yang bisa membaca cookie dari `NextRequest` dan memvalidasi sesi.

3. **Tombol tanpa onClick handler (Bug 2)**: Di `components/layout/user-nav.tsx`, tombol "Keluar" (baris 53-56) tidak memiliki `onClick` handler. Di `components/layout/sidebar.tsx`, button di user section (baris 95-104) juga tidak memiliki `onClick` handler.

4. **signOut() tanpa redirect (Bug 2)**: Di `hooks/use-auth.tsx`, fungsi `signOut` hanya memanggil `supabase.auth.signOut()` tanpa melakukan `window.location.href = "/auth/login"` atau `router.push("/auth/login")` setelahnya.

## Correctness Properties

Property 1: Bug Condition - Middleware Validasi Sesi Server-Side

_For any_ request ke rute `/dashboard/*` di mana user tidak memiliki sesi Supabase yang valid (isBugCondition returns true untuk type "navigation"), middleware yang diperbaiki SHALL memvalidasi sesi menggunakan `supabase.auth.getUser()` dan redirect ke `/auth/login?redirect={originalPath}`.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Tombol Logout Berfungsi

_For any_ klik pada tombol "Keluar" di `UserNav` atau user section di `Sidebar` (isBugCondition returns true untuk type "logout"), komponen yang diperbaiki SHALL memanggil `signOut()` dari `useAuth` hook yang kemudian menghapus sesi dan redirect ke `/auth/login`.

**Validates: Requirements 2.2, 2.3, 2.4**

Property 3: Preservation - Akses Dashboard dengan Sesi Valid

_For any_ request ke rute `/dashboard/*` di mana user memiliki sesi Supabase yang valid (isBugCondition returns false), middleware yang diperbaiki SHALL mengizinkan akses tanpa redirect, mempertahankan perilaku yang sama seperti sebelum perbaikan.

**Validates: Requirements 3.1, 3.3, 3.4**

Property 4: Preservation - Akses Rute Publik

_For any_ request ke rute non-protected (`/`, `/auth/*`) (isBugCondition returns false), middleware yang diperbaiki SHALL mengizinkan akses tanpa memeriksa autentikasi, mempertahankan perilaku yang sama seperti sebelum perbaikan.

**Validates: Requirements 3.2**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `lib/supabase/server.ts` (NEW)

**Specific Changes**:
1. **Buat server-side Supabase client**: Buat file baru `lib/supabase/server.ts` yang menggunakan `createServerClient` dari `@supabase/ssr` untuk membuat Supabase client yang bisa membaca/menulis cookie dari `NextRequest`/`NextResponse`. Fungsi ini menerima `NextRequest` dan `NextResponse` sebagai parameter dan mengkonfigurasi cookie handling via `cookies.getAll()` dan `cookies.set()`.

---

**File**: `middleware.ts`

**Function**: `middleware`

**Specific Changes**:
2. **Ganti cookie check dengan validasi sesi server-side**: Hapus logika `allCookies.some(cookie => cookie.name.includes("auth-token"))`. Ganti dengan:
   - Buat `NextResponse.next()` dengan forwarded request headers
   - Buat server-side Supabase client menggunakan fungsi dari `lib/supabase/server.ts`
   - Panggil `supabase.auth.getUser()` untuk validasi sesi
   - Jika `error` atau tidak ada `user`, redirect ke `/auth/login?redirect={pathname}`
   - Jika valid, return response (yang sudah di-update cookie-nya oleh Supabase client)

---

**File**: `hooks/use-auth.tsx`

**Function**: `signOut`

**Specific Changes**:
3. **Tambahkan redirect setelah signOut**: Setelah `await supabase.auth.signOut()`, tambahkan `window.location.href = "/auth/login"` untuk melakukan full page reload ke halaman login. Gunakan `window.location.href` bukan `router.push` agar middleware bisa mengevaluasi state baru.

---

**File**: `components/layout/user-nav.tsx`

**Specific Changes**:
4. **Tambahkan onClick handler pada tombol "Keluar"**: Import `useAuth` hook, destructure `signOut`, dan tambahkan `onClick={() => signOut()}` pada tombol "Keluar" di dropdown menu.

---

**File**: `components/layout/sidebar.tsx`

**Specific Changes**:
5. **Tambahkan onClick handler pada user section**: Import `useAuth` hook, destructure `signOut`, dan tambahkan `onClick={() => signOut()}` pada button di user section bagian bawah sidebar.

---

**Package Installation**:
6. **Install `@supabase/ssr`**: Jalankan `npm install @supabase/ssr` untuk menambahkan dependency yang diperlukan untuk server-side Supabase client di middleware.

## Testing Strategy

### Validation Approach

Strategi testing mengikuti pendekatan dua fase: pertama, surface counterexample yang mendemonstrasikan bug pada kode yang belum diperbaiki, lalu verifikasi bahwa perbaikan bekerja dengan benar dan mempertahankan perilaku yang ada.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexample yang mendemonstrasikan bug SEBELUM implementasi perbaikan. Konfirmasi atau bantah analisis root cause. Jika dibantah, perlu re-hypothesize.

**Test Plan**: Tulis test yang mensimulasikan request ke rute protected dengan berbagai kondisi cookie, dan test yang memeriksa apakah tombol logout memiliki handler. Jalankan test ini pada kode yang BELUM diperbaiki untuk mengamati kegagalan.

**Test Cases**:
1. **Middleware Cookie-Only Test**: Kirim request ke `/dashboard/main` dengan cookie `auth-token` palsu — middleware seharusnya mengizinkan akses (akan gagal pada kode belum diperbaiki karena ini adalah bug)
2. **Middleware No Cookie Test**: Kirim request ke `/dashboard/main` tanpa cookie — middleware seharusnya redirect (ini sudah benar di kode saat ini)
3. **UserNav Logout Handler Test**: Render `UserNav`, klik tombol "Keluar", periksa apakah `signOut` dipanggil (akan gagal pada kode belum diperbaiki)
4. **Sidebar Logout Handler Test**: Render `Sidebar`, klik button user section, periksa apakah `signOut` dipanggil (akan gagal pada kode belum diperbaiki)
5. **SignOut Redirect Test**: Panggil `signOut()`, periksa apakah redirect ke `/auth/login` terjadi (akan gagal pada kode belum diperbaiki)

**Expected Counterexamples**:
- Request dengan cookie palsu berhasil mengakses dashboard tanpa redirect
- Klik tombol "Keluar" tidak memicu fungsi apapun
- `signOut()` berhasil menghapus sesi tapi tidak redirect

### Fix Checking

**Goal**: Verifikasi bahwa untuk semua input di mana bug condition terpenuhi, fungsi yang diperbaiki menghasilkan perilaku yang diharapkan.

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition(request) AND request.type == "navigation" DO
  response := middleware_fixed(request)
  ASSERT response.status == 307
  ASSERT response.headers.location CONTAINS "/auth/login"
  ASSERT response.headers.location CONTAINS "redirect=" + request.pathname
END FOR

FOR ALL click WHERE isBugCondition(click) AND click.type == "logout" DO
  result := handleLogoutClick_fixed(click)
  ASSERT signOutCalled == true
  ASSERT redirectedTo == "/auth/login"
END FOR
```

### Preservation Checking

**Goal**: Verifikasi bahwa untuk semua input di mana bug condition TIDAK terpenuhi, fungsi yang diperbaiki menghasilkan hasil yang sama dengan fungsi asli.

**Pseudocode:**
```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT middleware_original(request).status == middleware_fixed(request).status
  ASSERT middleware_original(request).headers == middleware_fixed(request).headers
END FOR
```

**Testing Approach**: Property-based testing direkomendasikan untuk preservation checking karena:
- Menghasilkan banyak test case secara otomatis di seluruh domain input
- Menangkap edge case yang mungkin terlewat oleh unit test manual
- Memberikan jaminan kuat bahwa perilaku tidak berubah untuk semua input non-buggy

**Test Plan**: Observasi perilaku pada kode BELUM diperbaiki terlebih dahulu untuk request dengan sesi valid dan navigasi rute publik, lalu tulis property-based test yang menangkap perilaku tersebut.

**Test Cases**:
1. **Valid Session Preservation**: Verifikasi bahwa request ke `/dashboard/*` dengan sesi valid tetap diizinkan setelah perbaikan
2. **Public Route Preservation**: Verifikasi bahwa request ke `/`, `/auth/login`, `/auth/register` tetap bisa diakses tanpa autentikasi
3. **Login Flow Preservation**: Verifikasi bahwa flow login (email/password dan Google OAuth) tetap berfungsi dan redirect ke dashboard
4. **Auth Redirect Preservation**: Verifikasi bahwa user yang sudah login dan mengakses `/auth/login` tetap di-redirect ke dashboard

### Unit Tests

- Test middleware dengan berbagai kombinasi cookie dan sesi (valid, expired, palsu, tidak ada)
- Test `signOut()` hook memastikan redirect terjadi setelah logout
- Test render `UserNav` dan `Sidebar` memastikan tombol logout memiliki handler
- Test server-side Supabase client creation dengan mock cookie

### Property-Based Tests

- Generate random path dan session state, verifikasi middleware menghasilkan response yang benar (redirect atau allow)
- Generate random kombinasi cookie (valid/invalid/missing), verifikasi middleware memvalidasi dengan benar
- Test bahwa semua rute publik tetap accessible untuk semua kombinasi auth state

### Integration Tests

- Test full flow: user tanpa sesi → navigasi ke dashboard → redirect ke login → login → redirect kembali ke dashboard
- Test full flow: user login → klik "Keluar" → sesi dihapus → redirect ke login → tidak bisa akses dashboard
- Test bahwa `redirect` query parameter dipertahankan melalui seluruh flow login
