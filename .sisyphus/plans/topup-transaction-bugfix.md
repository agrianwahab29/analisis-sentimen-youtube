# Fix: Top-Up Transaction Bug — "Failed to create transaction" (HTTP 500)

## TL;DR

> **Quick Summary**: Fix 5 bug pada alur top-up transaction — yang paling kritis adalah RPC function `add_credits_to_user` yang tidak ada di database, menyebabkan seluruh alur pembayaran gagal.
> 
> **Deliverables**:
> - SQL migration: Buat fungsi `add_credits_to_user` yang benar di Supabase
> - Fix webhook status mismatch (`pending_verification` vs `pending`)
> - Fix admin auth di approve/reject endpoint
> - Tambah input nomor WhatsApp di form top-up
> - Buat endpoint `/api/admin/activity` yang hilang
> - Setup Vitest + test cases untuk semua bug fix
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (RPC function) → Task 5 (callback fix) → Task 7 (integration test)

---

## Context

### Original Request
User melaporkan error "Failed to create transaction" saat top up via WhatsApp di `/dashboard/topup`. Endpoint `/api/topup/generate` mengembalikan HTTP 500. Semua environment variables sudah di-set di Vercel. User juga minta analisis bagian admin.

### Interview Summary
**Key Discussions**:
- Error: HTTP 500 pada `/api/topup/generate` saat buat transaksi WhatsApp
- Browser console: `/api/topup/generate:1 Failed to load resource: the server responded with a status of 500`
- Semua env vars sudah di-set di Vercel (user konfirmasi)
- User minta analisis admin side juga

**Decisions**:
- Bug #1 fix: Buat fungsi baru `add_credits_to_user` di database (bukan ubah kode)
- Bug #3 fix: Nomor WhatsApp dari input user di form
- Test strategy: Setup Vitest (belum ada test infrastructure)

### Metis Review — Critical Additional Findings
**Identified Gaps** (addressed):
1. **`admin_add_credits` uses `auth.uid()`** — KEDUA pemanggil (webhook + admin API) pakai service role key, jadi `auth.uid()` = NULL → function akan GAGAL. **Solusi**: Fungsi baru `add_credits_to_user` harus TIDAK mengecek `auth.uid()`, tapi pakai SECURITY DEFINER langsung tanpa auth check di dalamnya, karena pemanggil sudah divalidasi di API layer.
2. **`admin_add_credits` juga CREATE transaction record** (duplikat) — Fungsi baru hanya perlu UPDATE credit_balance, TIDAK membuat transaksi baru.
3. **`admin_logs` RLS juga blok service role** — Policy `admin_logs_insert_policy` pakai `is_admin()` yang cek `auth.uid()`. Service role → NULL → GAGAL. **Solusi**: Update RLS policy atau bypass dengan service role.
4. **`paid_at` column** — Admin approve set `paid_at` tapi perlu verifikasi kolom ini ada di table.

---

## Work Objectives

### Core Objective
Fix semua bug pada alur top-up transaction sehingga user bisa membuat transaksi, admin bisa approve/reject, dan credits ter-add dengan benar.

### Concrete Deliverables
- File SQL migration baru: `supabase/migrations/add_credits_to_user_function.sql`
- Fixed: `app/api/topup/generate/route.ts` (WhatsApp number input)
- Fixed: `app/api/topup/callback/route.ts` (status mismatch, RPC fix)
- Fixed: `app/api/admin/transactions/[id]/route.ts` (auth fix, RPC fix)
- New: `app/api/admin/activity/route.ts`
- Fixed: `app/dashboard/topup/page.tsx` (WhatsApp input field)
- New: `vitest.config.ts` + test files

### Definition of Done
- [ ] User bisa buat transaksi top-up via WhatsApp tanpa error 500
- [ ] Admin bisa approve transaksi dan credits ter-add ke user
- [ ] Webhook callback bisa match transaksi yang sudah dibuat
- [ ] Semua test cases pass

### Must Have
- Fungsi `add_credits_to_user` yang bekerja dengan service role key
- Status matching antara generate dan callback
- Admin auth yang benar (cookie-based)
- Input nomor WhatsApp dari user
- Endpoint `/api/admin/activity` berfungsi

### Must NOT Have (Guardrails)
- JANGAN hapus fungsi `admin_add_credits` yang sudah ada (dipakai tempat lain)
- JANGAN ubah structure tabel transactions yang sudah ada
- JANGAN tambah fitur baru di luar bug fix
- JANGAN hardcode nomor WhatsApp
- JANGAN over-comment kode

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: YES (setup + tests)
- **Framework**: Vitest
- **Approach**: Tests-after (fix bugs first, then write tests)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Database**: Use Bash (supabase CLI or API) — Query tables, verify data

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + DB fix):
├── Task 1: Buat SQL migration `add_credits_to_user` function [deep]
├── Task 2: Fix admin_logs RLS policy for service role [quick]
├── Task 3: Fix admin auth di transactions/[id]/route.ts [quick]
└── Task 4: Tambah WhatsApp number input di topup page [visual-engineering]

Wave 2 (After Wave 1 — core fixes):
├── Task 5: Fix callback status mismatch + RPC call [unspecified-high]
├── Task 6: Fix generate route — dynamic WhatsApp number [quick]
└── Task 7: Buat /api/admin/activity endpoint [unspecified-high]

Wave 3 (After Wave 2 — tests):
├── Task 8: Setup Vitest + config [quick]
├── Task 9: Test: generate route + transaction creation [unspecified-high]
├── Task 10: Test: admin approve/reject + credits [unspecified-high]
└── Task 11: Test: webhook callback flow [unspecified-high]

Wave FINAL (After ALL tasks — verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 5 → Task 9
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 5, 9, 10, 11 | 1 |
| 2 | — | 3, 7 | 1 |
| 3 | 2 | 10 | 1 |
| 4 | — | 6 | 1 |
| 5 | 1 | 9, 11 | 2 |
| 6 | 4 | 9 | 2 |
| 7 | 2 | 11 | 2 |
| 8 | — | 9, 10, 11 | 3 |
| 9 | 5, 6, 8 | F1-F4 | 3 |
| 10 | 3, 8 | F1-F4 | 3 |
| 11 | 5, 7, 8 | F1-F4 | 3 |

### Agent Dispatch Summary

- **Wave 1**: **4** — T1 → `deep`, T2 → `quick`, T3 → `quick`, T4 → `visual-engineering`
- **Wave 2**: **3** — T5 → `unspecified-high`, T6 → `quick`, T7 → `unspecified-high`
- **Wave 3**: **4** — T8 → `quick`, T9 → `unspecified-high`, T10 → `unspecified-high`, T11 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.

- [x] 1. Buat SQL Migration: Fungsi `add_credits_to_user`

  **What to do**:
  - Buat file migration baru `supabase/migrations/add_credits_to_user_function.sql`
  - Definisikan fungsi `add_credits_to_user(user_uuid UUID, credits INTEGER)` yang:
    - Hanya UPDATE `credit_balance` di tabel `users` (TIDAK buat transaksi baru — itu sudah ditangani di API layer)
    - Pakai `SECURITY DEFINER` supaya bisa dijalankan dengan service role key
    - TIDAK mengecek `auth.uid()` karena akan dipanggil dari webhook (tanpa user session) dan admin API (service role)
    - Return BOOLEAN
  - Juga perbaiki RLS policy pada `admin_logs` agar service role bisa INSERT (tambah policy `admin_logs_service_insert` yang USING `true` atau `current_setting('role') = 'supabase_service_role'`)
  - JALANKAN migration di Supabase dashboard atau via `supabase db push`

  **Must NOT do**:
  - JANGAN hapus fungsi `admin_add_credits` yang sudah ada
  - JANGAN ubah signature fungsi yang ada
  - JANGAN tambah auth.uid() check di fungsi baru

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: SQL migration design membutuhkan pemahaman mendalam tentang security, RLS, dan service role interaction
  - **Skills**: [`context7`]
    - `context7`: Untuk referensi Supabase PL/pgSQL function patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 9, 10, 11
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `supabase/migrations/rombak_total_admin_panel.sql:150-201` — Pattern fungsi `admin_add_credits` sebagai referensi struktur, tapi JANGAN copy auth.uid() check
  - `supabase/migrations/add_admin_features.sql:116-125` — Pattern fungsi `is_admin()` sebagai referensi SECURITY DEFINER

  **API/Type References** (contracts to implement against):
  - `app/api/topup/callback/route.ts:178` — Pemanggilan `supabase.rpc("add_credits_to_user", { user_uuid: transaction.user_id, credits: transaction.total_credits })` — signature harus cocok: 2 params `(user_uuid UUID, credits INTEGER)`
  - `app/api/admin/transactions/[id]/route.ts:107` — Pemanggilan yang sama, signature harus cocok

  **WHY Each Reference Matters**:
  - `rombak_total_admin_panel.sql:150` — Ini adalah fungsi yang sudah ada. Fungsi baru HARUS berbeda: tanpa auth check, tanpa buat transaksi record
  - `callback/route.ts:178` — Ini yang akan memanggil fungsi baru. Signature `{ user_uuid, credits }` harus exact match

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Fungsi add_credits_to_user berhasil menambah credits
    Tool: Bash (supabase query via API)
    Preconditions: Supabase project accessible, service role key available
    Steps:
      1. Query: SELECT add_credits_to_user('{test-user-uuid}', 100)
      2. Verify: SELECT credit_balance FROM users WHERE id = '{test-user-uuid}'
    Expected Result: credit_balance bertambah 100 dari sebelumnya
    Failure Indicators: Function not found, permission denied, credit_balance unchanged
    Evidence: .sisyphus/evidence/task-1-rpc-function-test.txt

  Scenario: Fungsi bekerja tanpa authenticated user session (service role only)
    Tool: Bash (curl ke Supabase REST API)
    Preconditions: Service role key, no auth cookies
    Steps:
      1. curl -X POST Supabase REST endpoint dengan service role key header
      2. Call rpc/add_credits_to_user dengan test data
    Expected Result: Berhasil tanpa "Only admin can" error
    Failure Indicators: "Only admin" error, auth.uid() check failure
    Evidence: .sisyphus/evidence/task-1-service-role-test.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `fix(db): add add_credits_to_user function and fix admin_logs RLS`
  - Files: `supabase/migrations/add_credits_to_user_function.sql`

---

- [x] 2. Fix Admin Auth di Transactions [id] Route

  **What to do**:
  - Di file `app/api/admin/transactions/[id]/route.ts`:
    1. Ganti cara pembuatan Supabase client dari manual `createClient(url, serviceKey)` menjadi menggunakan `createSupabaseRouteHandlerClient()` dari `@/lib/supabase/server` — ini akan properly handle session cookies
    2. Setelah mendapatkan user dari cookie-based client, BUAT service role client TERPISAH untuk operasi database (bypass RLS)
    3. Pattern: cookie client untuk auth → service role client untuk DB operations
    4. Tetap pertahankan email check `agrianwahab10@gmail.com` untuk admin verification
  - Perbaiki juga RPC call di line 107: pastikan `add_credits_to_user` dipanggil dengan BENAR (akan di-fix oleh Task 1, tapi pastikan parameternya sesuai)

  **Must NOT do**:
  - JANGAN hapus admin email check
  - JANGAN ubah response format yang sudah ada
  - JANGAN gabung auth client dan DB client jadi satu

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Perubahan kecil, pattern sudah jelas dari file `lib/supabase/server.ts`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 10
  - **Blocked By**: None (Task 2 RLS fix is separate)

  **References**:

  **Pattern References**:
  - `app/api/topup/generate/route.ts:17-51` — Pattern DUA Supabase clients: cookie-based untuk auth (line 18), service role untuk DB (line 46). COPY pattern ini.
  - `lib/supabase/server.ts:113-140` — `createSupabaseRouteHandlerClient()` factory function yang harus digunakan

  **API/Type References**:
  - `app/api/admin/transactions/[id]/route.ts:33-36` — Kode yang harus diganti (manual createClient → route handler client)

  **WHY Each Reference Matters**:
  - `generate/route.ts:17-51` — Pattern yang sudah bekerja. Admin route harus mengikuti pattern yang sama persis.
  - `server.ts:113` — Factory function yang sudah ada dan bekerja untuk route handlers

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Admin bisa approve transaksi dengan session cookie
    Tool: Bash (curl)
    Preconditions: Admin logged in, ada transaksi pending_verification di DB
    Steps:
      1. curl -X PATCH http://localhost:3000/api/admin/transactions/{transaction-id} \
           -H "Content-Type: application/json" \
           -H "Cookie: {admin-session-cookie}" \
           -d '{"action":"approve"}'
      2. Parse JSON response
    Expected Result: Response 200, { success: true, credits_added: N }
    Failure Indicators: 401 Unauthorized, 403 Forbidden, 500 error
    Evidence: .sisyphus/evidence/task-3-admin-approve.txt

  Scenario: Non-admin user ditolak saat approve
    Tool: Bash (curl)
    Preconditions: Non-admin user logged in
    Steps:
      1. curl -X PATCH http://localhost:3000/api/admin/transactions/{id} \
           -H "Cookie: {non-admin-cookie}" \
           -d '{"action":"approve"}'
    Expected Result: Response 403 { error: "Admin access required" }
    Failure Indicators: 200 success (unauthorized access granted)
    Evidence: .sisyphus/evidence/task-3-non-admin-rejected.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `fix(admin): use cookie-based auth for admin transaction endpoints`
  - Files: `app/api/admin/transactions/[id]/route.ts`

---

- [x] 3. Tambah WhatsApp Number Input di Topup Page

  **What to do**:
  - Di file `app/dashboard/topup/page.tsx`:
    1. Tambah state `whatsappNumber` (string)
    2. Tambah input field di form top-up untuk nomor WhatsApp (sebelum tombol "Buat Transaksi")
    3. Validasi: nomor harus dimulai dengan "08" atau "628" dan hanya angka, min 10 digit
    4. Kirim `whatsappNumber` sebagai bagian dari body POST ke `/api/topup/generate`
    5. Tampilkan error jika nomor tidak valid
  - Update `handleCreateTransaction` untuk include whatsappNumber di request body
  - Update WhatsApp redirect URL untuk menggunakan nomor yang diinput user (bukan hardcoded)

  **Must NOT do**:
  - JANGAN ubah package definitions
  - JANGAN ubah layout/component structure yang sudah ada secara signifikan
  - JANGAN hapus fitur yang sudah ada

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI change — form input + validation + styling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/dashboard/topup/page.tsx:75-113` — Function `handleCreateTransaction` yang harus diupdate
  - `app/dashboard/topup/page.tsx:258` — Tombol "Buat Transaksi & Bayar via WhatsApp"
  - `app/dashboard/topup/page.tsx:352-361` — WhatsApp URL redirect yang harus pakai dynamic number

  **API/Type References**:
  - `app/dashboard/topup/page.tsx` — Full page component (373 lines)

  **WHY Each Reference Matters**:
  - `page.tsx:75-113` — Ini handler function yang harus ditambah whatsappNumber parameter
  - `page.tsx:352-361` — WhatsApp link yang harus pakai nomor dari input, bukan hardcoded

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: User bisa input nomor WhatsApp dan buat transaksi
    Tool: Playwright
    Preconditions: User logged in, di halaman /dashboard/topup
    Steps:
      1. Isi input "Nomor WhatsApp" dengan "081234567890"
      2. Pilih package "Standard"
      3. Klik tombol "Buat Transaksi & Bayar via WhatsApp"
      4. Assert: toast success muncul ATAU redirect ke WhatsApp dengan nomor yang diinput
    Expected Result: Transaksi berhasil dibuat, WhatsApp terbuka dengan nomor user
    Failure Indicators: Error "Nomor WhatsApp wajib diisi" atau error 500
    Evidence: .sisyphus/evidence/task-4-wa-input-success.png

  Scenario: Validasi nomor WhatsApp kosong atau invalid
    Tool: Playwright
    Preconditions: User logged in, di halaman /dashboard/topup
    Steps:
      1. Biarkan nomor WhatsApp kosong
      2. Klik tombol "Buat Transaksi"
      3. Assert: error message muncul
      4. Isi nomor dengan "abc123" (invalid)
      5. Klik tombol lagi
      6. Assert: error message muncul
    Expected Result: Validasi menolak input kosong dan format salah
    Failure Indicators: Request tetap terkirim dengan data invalid
    Evidence: .sisyphus/evidence/task-4-wa-validation.png
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(topup): add WhatsApp number input to topup form`
  - Files: `app/dashboard/topup/page.tsx`

---

- [x] 4. Fix Callback Status Mismatch + RPC Call

  **What to do**:
  - Di file `app/api/topup/callback/route.ts`:
    1. Line 101: Ubah filter `.eq("payment_status", "pending")` menjadi `.in("payment_status", ["pending", "pending_verification"])` supaya webhook bisa menemukan transaksi WhatsApp yang berstatus `pending_verification`
    2. Line 178: RPC call sudah benar memanggil `add_credits_to_user` — setelah Task 1 selesai, ini akan bekerja
    3. Tambah idempotency check: sebelum update status ke "paid", verifikasi bahwa transaksi belum di-approve sebelumnya (cek `payment_status !== "paid"`)
    4. Tambah logging yang lebih baik untuk debugging

  **Must NOT do**:
  - JANGAN ubah Sociabuzz webhook payload parsing
  - JANGAN hapus createTransaction helper (masih dipakai untuk Sociabuzz flow)
  - JANGAN ubah response format

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Logika webhook yang kompleks, perlu hati-hati dengan status flow
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs Task 1 complete)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 9, 11
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `app/api/topup/callback/route.ts:94-110` — Kode yang mencari transaksi, harus diubah filter statusnya
  - `app/api/topup/generate/route.ts:105` — Transaksi dibuat dengan status `pending_verification`

  **API/Type References**:
  - `app/api/topup/callback/route.ts:178` — RPC call yang harus cocok dengan Task 1

  **WHY Each Reference Matters**:
  - `callback/route.ts:101` — Ini baris yang menyebabkan webhook tidak menemukan transaksi WhatsApp
  - `generate/route.ts:105` — Ini source of truth untuk status yang digenerate

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Webhook bisa menemukan transaksi pending_verification
    Tool: Bash (curl)
    Preconditions: Ada transaksi dengan status "pending_verification" di DB
    Steps:
      1. curl -X POST http://localhost:3000/api/topup/callback \
           -H "Content-Type: application/json" \
           -d '{"order_id":"test-order","amount":25000,"status":"paid","email":"test@test.com","message":"Voucher: VID-ABC123"}'
      2. Parse response
    Expected Result: Transaksi ditemukan, status diupdate ke "paid", credits ditambahkan
    Failure Indicators: "Transaction not found" atau duplicate transaction created
    Evidence: .sisyphus/evidence/task-5-callback-status-match.txt

  Scenario: Idempotency — webhook tidak double-process transaksi yang sudah paid
    Tool: Bash (curl)
    Preconditions: Transaksi sudah berstatus "paid"
    Steps:
      1. Kirim webhook payload yang sama lagi
      2. Assert: credits TIDAK bertambah kedua kalinya
    Expected Result: Response sukses tapi credits tidak berubah
    Failure Indicators: credit_balance bertambah lagi (double credit)
    Evidence: .sisyphus/evidence/task-5-idempotency.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `fix(callback): match pending_verification status, add idempotency check`
  - Files: `app/api/topup/callback/route.ts`

---

- [x] 5. Fix Generate Route — Dynamic WhatsApp Number

  **What to do**:
  - Di file `app/api/topup/generate/route.ts`:
    1. Ambil `whatsappNumber` dari request body (selain `packageId`)
    2. Validasi: harus ada, harus dimulai "08" atau "628", hanya angka, min 10 digit
    3. Ganti hardcoded `"082291134197"` di line 107 dengan `whatsappNumber` dari input user
    4. Return error 400 jika whatsappNumber tidak valid

  **Must NOT do**:
  - JANGAN ubah auth logic
  - JANGAN ubah package definitions
  - JANGAN ubah voucher code generation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Perubahan kecil, ganti hardcoded value jadi dynamic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs Task 4 complete for frontend)
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `app/api/topup/generate/route.ts:65-72` — Pattern validasi input (`packageId`) — copy pattern ini untuk `whatsappNumber`
  - `app/api/topup/generate/route.ts:107` — Baris yang harus diganti

  **WHY Each Reference Matters**:
  - `generate/route.ts:65-72` — Pattern validasi yang sudah ada, tinggal tambah validasi serupa untuk WA number
  - `generate/route.ts:107` — Hardcoded value yang harus jadi dynamic

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Generate transaksi dengan WhatsApp number dari input
    Tool: Bash (curl)
    Preconditions: User authenticated
    Steps:
      1. curl -X POST http://localhost:3000/api/topup/generate \
           -H "Content-Type: application/json" \
           -H "Cookie: {session-cookie}" \
           -d '{"packageId":"standard","whatsappNumber":"081234567890"}'
      2. Parse response, check transaction_id
      3. Query DB: SELECT whatsapp_number FROM transactions WHERE id = '{transaction_id}'
    Expected Result: Response 200, DB menunjukkan whatsapp_number = "081234567890"
    Failure Indicators: whatsapp_number masih "082291134197" atau error 400/500
    Evidence: .sisyphus/evidence/task-6-dynamic-wa.txt

  Scenario: Reject transaksi tanpa WhatsApp number
    Tool: Bash (curl)
    Steps:
      1. curl -X POST http://localhost:3000/api/topup/generate \
           -d '{"packageId":"standard"}'
    Expected Result: Response 400 { error: "WhatsApp number required" }
    Failure Indicators: Transaksi tetap dibuat tanpa WA number
    Evidence: .sisyphus/evidence/task-6-missing-wa.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `fix(topup): use dynamic WhatsApp number from user input`
  - Files: `app/api/topup/generate/route.ts`

---

- [x] 6. Buat /api/admin/activity Endpoint

  **What to do**:
  - Buat file baru `app/api/admin/activity/route.ts`
  - Endpoint GET yang mengembalikan recent admin activity dari tabel `admin_logs`
  - Query: SELECT dari `admin_logs` ORDER BY `created_at` DESC LIMIT 20
  - Include JOIN dengan `users` table untuk mendapatkan admin email/nama
  - Auth: Gunakan pattern yang sama dengan admin transactions (cookie-based auth + admin email check)
  - Response format: `{ success: true, activities: [{ id, action, target_id, metadata, created_at, admin_email }] }`

  **Must NOT do**:
  - JANGAN buat admin_logs table baru (sudah ada dari migration)
  - JANGAN ubah komponen `recent-activity.tsx` yang sudah ada

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Endpoint baru dengan auth + join query, tapi pattern sudah ada
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs Task 2 for auth pattern reference)
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 11
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `app/api/admin/transactions/route.ts` — Pattern auth + query untuk admin endpoints. COPY pattern auth dari sini.
  - `app/api/admin/stats/route.ts` — Pattern GET endpoint untuk admin dashboard

  **API/Type References**:
  - `components/admin/recent-activity.tsx` — Komponen yang akan mengkonsumsi endpoint ini. Perhatikan expected response format.

  **WHY Each Reference Matters**:
  - `admin/transactions/route.ts` — Auth pattern yang harus diikuti
  - `recent-activity.tsx` — Client yang akan consume API. Response harus cocok dengan yang diharapkan komponen.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Admin bisa melihat activity log
    Tool: Bash (curl)
    Preconditions: Admin logged in, ada activity entries di admin_logs
    Steps:
      1. curl http://localhost:3000/api/admin/activity -H "Cookie: {admin-cookie}"
      2. Parse JSON response
    Expected Result: Response 200, { success: true, activities: [...] }
    Failure Indicators: 404 (endpoint not found), 403, 500
    Evidence: .sisyphus/evidence/task-7-activity-endpoint.txt

  Scenario: Non-admin ditolak akses activity
    Tool: Bash (curl)
    Steps:
      1. curl http://localhost:3000/api/admin/activity -H "Cookie: {non-admin-cookie}"
    Expected Result: Response 403 { error: "Admin access required" }
    Failure Indicators: 200 dengan data (unauthorized access)
    Evidence: .sisyphus/evidence/task-7-activity-auth.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(admin): add /api/admin/activity endpoint`
  - Files: `app/api/admin/activity/route.ts`

---

- [x] 7. Setup Vitest Configuration

  **What to do**:
  - Install vitest: `npm install -D vitest @vitejs/plugin-react jsdom`
  - Buat `vitest.config.ts` di root project dengan konfigurasi:
    - test.environment = 'node'
    - test.globals = true
    - setup files
  - Tambah script di `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`
  - Buat folder `__tests__/` atau `tests/` di root
  - Buat satu test file contoh `tests/setup.test.ts` yang verify vitest berjalan
  - Verify: `npm test` berjalan tanpa error

  **Must NOT do**:
  - JANGAN install Jest atau framework lain
  - JANGAN ubah existing build config (next.config)
  - JANGAN buat test untuk semua file — hanya setup

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard vitest setup, banyak referensi
  - **Skills**: [`context7`]
    - `context7`: Referensi vitest config untuk Next.js

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation for tests)
  - **Parallel Group**: Wave 3 (must complete before Tasks 9-11)
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: None (can start earlier but grouped in Wave 3)

  **References**:

  **External References**:
  - Vitest docs: https://vitest.dev/config/
  - Pattern: Next.js + Vitest setup

  **WHY Each Reference Matters**:
  - Need correct config for Next.js path aliases (@/) in vitest

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Vitest berjalan dengan benar
    Tool: Bash
    Preconditions: vitest installed, config created
    Steps:
      1. Run: npm test
      2. Check output for test results
    Expected Result: "Tests X passed" — setup test passes
    Failure Indicators: "Cannot find module", config error, no tests found
    Evidence: .sisyphus/evidence/task-8-vitest-setup.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `chore(test): setup vitest for API route testing`
  - Files: `vitest.config.ts`, `package.json`, `tests/setup.test.ts`

---

- [x] 8. Test: Generate Route + Transaction Creation

  **What to do**:
  - Buat file `tests/api/topup/generate.test.ts`
  - Test cases:
    1. Berhasil membuat transaksi dengan package valid + WhatsApp number
    2. Reject tanpa packageId
    3. Reject tanpa whatsappNumber
    4. Reject dengan packageId invalid
    5. Reject tanpa auth (no session)
    6. Verifikasi transaction data yang di-insert ke DB (mock Supabase)
  - Mock: Supabase client, auth.getUser(), insert()
  - Follow pattern: AAA (Arrange-Act-Assert)

  **Must NOT do**:
  - JANGAN test terhadap real database (mock semua)
  - JANGAN test UI components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test design dengan mocking yang proper
  - **Skills**: [`context7`]
    - `context7`: Vitest mocking patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 5, 6, 8

  **References**:

  **Pattern References**:
  - `app/api/topup/generate/route.ts` — Full file yang akan di-test. Perhatikan semua branch.

  **Test References**:
  - `vitest.config.ts` — Config yang dibuat di Task 8

  **WHY Each Reference Matters**:
  - `generate/route.ts` — Setiap error path harus di-test

  **Acceptance Criteria**:
  - [ ] Test file created: tests/api/topup/generate.test.ts
  - [ ] npx vitest run tests/api/topup/generate.test.ts → PASS (6 tests, 0 failures)

  **Commit**: YES (groups with Wave 3)
  - Message: `test(topup): add generate route tests`
  - Files: `tests/api/topup/generate.test.ts`

---

- [x] 9. Test: Admin Approve/Reject + Credits

  **What to do**:
  - Buat file `tests/api/admin/transactions/[id].test.ts`
  - Test cases:
    1. Admin berhasil approve transaksi → credits ter-add
    2. Admin berhasil reject transaksi → status jadi rejected
    3. Non-admin ditolak (403)
    4. Unauthenticated ditolak (401)
    5. Transaction not found (404)
    6. Invalid action (400)
    7. RPC `add_credits_to_user` gagal → error handled
  - Mock: Supabase client, auth, RPC

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`context7`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 11)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `app/api/admin/transactions/[id]/route.ts` — File yang di-test
  - `tests/api/topup/generate.test.ts` — Pattern test yang dibuat di Task 9

  **Acceptance Criteria**:
  - [ ] npx vitest run tests/api/admin/transactions/[id].test.ts → PASS (7 tests)

  **Commit**: YES (groups with Wave 3)
  - Message: `test(admin): add transaction approve/reject tests`

---

- [x] 10. Test: Webhook Callback Flow

  **What to do**:
  - Buat file `tests/api/topup/callback.test.ts`
  - Test cases:
    1. Webhook menemukan transaksi pending_verification dan approve
    2. Webhook menemukan transaksi pending dan approve
    3. Webhook reject jika order_id kosong (400)
    4. Voucher code extraction dari message
    5. Idempotency — tidak double-process transaksi paid
    6. User not found → error handled
  - Mock: Supabase client, RPC, user queries

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`context7`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 5, 7, 8

  **References**:
  - `app/api/topup/callback/route.ts` — File yang di-test
  - `tests/api/topup/generate.test.ts` — Pattern test

  **Acceptance Criteria**:
  - [ ] npx vitest run tests/api/topup/callback.test.ts → PASS (6 tests)

  **Commit**: YES (groups with Wave 3)
  - Message: `test(callback): add webhook callback flow tests`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + linter + `npx vitest run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **After Wave 1**: `fix(topup): add credits function, fix admin auth, add WA input` — migration SQL, route fixes, page changes
- **After Wave 2**: `fix(topup): fix callback status match, add admin activity endpoint` — callback, activity route
- **After Wave 3**: `test(topup): add vitest setup and transaction tests` — config, test files
- **After FINAL**: `chore(topup): final review cleanup` — any remaining fixes

---

## Success Criteria

### Verification Commands
```bash
npx vitest run                    # Expected: ALL tests pass
npx tsc --noEmit                  # Expected: 0 errors
npm run build                     # Expected: Build successful
```

### Final Checklist
- [ ] User bisa buat transaksi top-up tanpa error 500
- [ ] Admin bisa approve → credits ter-add
- [ ] Admin bisa reject → status berubah
- [ ] Webhook callback bisa match transaksi
- [ ] Nomor WhatsApp dari input user
- [ ] Endpoint /api/admin/activity berfungsi
- [ ] Semua tests pass
