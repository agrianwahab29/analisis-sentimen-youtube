# Learnings — topup-transaction-bugfix

## 2026-04-02 Initial Investigation

### Architecture
- App uses Next.js App Router with Supabase
- Auth: cookie-based session via `createSupabaseRouteHandlerClient()`
- DB ops: service role key to bypass RLS
- Two Supabase client patterns: cookie (auth) + service role (DB)

### Database
- Function `admin_add_credits(user_uuid, credits, notes)` exists — uses `auth.uid()` check
- Function `add_credits_to_user` does NOT exist — called in 2 places
- `admin_logs` RLS uses `is_admin()` which checks `auth.uid()` — blocks service role
- Transaction statuses: `pending`, `pending_verification`, `paid`, `failed`, `rejected`
- WhatsApp transactions created with `pending_verification`, webhook queries `pending`

### Key Gotchas
- Service role key → `auth.uid()` returns NULL → any function checking auth.uid() will FAIL
- `admin_add_credits` also creates a transaction record (duplicate risk)
- Hardcoded WhatsApp number "082291134197" in generate route
- `/api/admin/activity` endpoint missing but component fetches it
## Admin Transaction Route Auth Fix

**Date:** 2026-04-02 08.23
**File:** pp/api/admin/transactions/[id]/route.ts

### Problem
The route created a Supabase client with the service role key and then called getUser() on it. This fails because the service role key doesn't have session cookies — getUser() requires cookie-based authentication to extract the JWT.

### Fix
Applied the two-client pattern from pp/api/topup/generate/route.ts:
1. **Session client** (createSupabaseRouteHandlerClient()) — reads cookies, validates JWT, authenticates user
2. **Service role client** (createClient(url, serviceKey)) — bypasses RLS for all DB operations

### Key Details
- createSupabaseRouteHandlerClient() returns { supabase, responseHeaders } — both must be used
- Service role client config: { auth: { autoRefreshToken: false, persistSession: false } }
- Admin email check grianwahab10@gmail.com preserved
- All approve/reject logic and RPC calls unchanged
- esponseHeaders included in early-return responses (401, 403, 500) to ensure cookies are set

### Pattern
Always use two-client pattern in admin routes: cookie client for auth, service client for DB writes.

## add_credits_to_user migration - 2026-04-02

- Created supabase/migrations/add_credits_to_user_function.sql
- Function dd_credits_to_user(user_uuid UUID, credits INTEGER) RETURNS BOOLEAN uses SECURITY DEFINER with NO uth.uid() check — designed for webhook/service-role contexts
- Uses RETURN FOUND pattern to return true/false based on whether the UPDATE matched any row
- Added RLS policy dmin_logs_service_insert scoped to service_role role only (TO service_role), preserving existing dmin_logs_insert_policy (which uses is_admin())
- Existing dmin_add_credits function left untouched — it has auth checks + transaction insert that we don't want
- Key pattern: CREATE POLICY ... TO service_role WITH CHECK (true) — the TO service_role restricts the policy to service role key calls only, making the WITH CHECK (true) safe
## WhatsApp Number Input - Topup Page (2026-04-02 08.26)

### Changes Made
- Added `whatsappNumber` state (useState string) to replace hardcoded constant
- Renamed admin number to `adminWhatsAppNumber` constant (6282291134197) — admin GoPay/WA target
- Added `isValidWhatsAppNumber` validation: starts with 08 or 628, digits only, min 10 chars
- Added Phone icon import from lucide-react
- Input field placed in payment section between instructions and create transaction button
- Input has real-time validation feedback (green/red border + helper text)
- `handleCreateTransaction` validates before fetch, sends `whatsappNumber` in POST body
- `generateWhatsAppUrl` includes user's WA number in message text (`WhatsApp Saya:` line)
- wa.me URL still targets admin number — user's number is informational for admin

### Design Patterns
- No shadcn Input component available — used plain HTML input with Tailwind matching existing style
- Consistent with page: rounded-lg, border-slate-200, green accent for valid, text-sm labels
- inputMode=`numeric` + onChange strips non-digits for clean input

### Key Distinction
- `adminWhatsAppNumber` (6282291134197) = TARGET of wa.me link (admin's phone)
- `whatsappNumber` (user input) = included in MESSAGE TEXT so admin knows who's paying
- These are DIFFERENT numbers serving different purposes

## Callback Status Fix (Task 4)
- Date: 2026-04-02 08.43
- Changed .eq('payment_status', 'pending') to .in('payment_status', ['pending', 'pending_verification']) on line 101
  - This lets the webhook find WhatsApp-generated transactions that have status pending_verification instead of pending`n- Added idempotency check before updating to 'paid' (lines 157-165)
  - If 	ransaction.payment_status === 'paid', return success immediately — prevents double credit addition from webhook retries
  - Critical for webhook reliability: Sociabuzz may retry webhooks, and without this check, credits get added multiple times
- TypeScript compilation passed with no errors
- createTransaction helper, payload parsing, and response formats all unchanged


## T5: Dynamic WhatsApp Number in Generate Route
- **Date**: 2026-04-02
- **Change**: Replaced hardcoded whatsapp_number: '082291134197' with dynamic whatsappNumber from request body
- **Validation regex**: /^(08|628)\d{8,13}$/ — accepts 08xx (10-15 digits) or 628xx (11-16 digits)
- **Pattern**: Same early-return-400 pattern as packageId validation
- **Key distinction**: whatsapp_number in transaction = USER's number (for admin reference), NOT admin's number
- **Frontend contract**: Frontend sends { packageId, whatsappNumber } in POST body

## [2026-04-02 08.51] Task: Create /api/admin/activity endpoint

### Created
- `app/api/admin/activity/route.ts` — GET endpoint for recent admin activity

### Auth Pattern
- Two-client pattern: sessionClient (cookie-based) for auth, service role client for admin_logs queries
- Same pattern as `app/api/admin/transactions/[id]/route.ts`

### Key Decisions
- `icon` field returned as string name (e.g. "CheckCircle") — cannot serialize React components in JSON
- `recent-activity.tsx` uses `<activity.icon className=.../>` directly as component — component will need icon name-to-component mapping added
- Action mapping: `approve_transaction` → action `approve_payment`, `reject_transaction` → action `reject_payment` (maps DB actions to component interface actions)
- Relative time in Indonesian: "Baru saja", "5 menit lalu", "2 jam lalu"
- Description built from metadata JSONB field, action-specific formatting

### Known Limitation
- `recent-activity.tsx` line 85 renders `activity.icon` as React component but API returns string. Component needs a mapping layer (e.g., `const ICON_MAP = { CheckCircle, AlertCircle, UserCheck, UserX, CreditCard }` then `const IconComp = ICON_MAP[activity.icon]`)
