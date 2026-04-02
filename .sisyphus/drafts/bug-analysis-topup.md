# Bug Analysis: Failed to Create Transaction

## Production URL
https://analisis-sentimen-youtube.vercel.app/dashboard/topup

## Error Summary
User mendapatkan error "Failed to create transaction" ketika mencoba top up via WhatsApp GoPay.

---

## Root Cause Analysis

### BUG 1: Missing Environment Variables on Vercel (PRIMARY CAUSE)

**File**: `app/api/topup/generate/route.ts:33-44`

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials - URL:", !!supabaseUrl, "ServiceKey:", !!supabaseServiceKey);
  return NextResponse.json(
    { error: "Server configuration error - missing credentials" },
    { status: 500 }
  );
}
```

**Problem**: File `.env.production` HANYA berisi:
```
NEXT_PUBLIC_SITE_URL=https://analisis-sentimen-youtube.vercel.app
```

**Tidak ada**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Ini berarti ketika di-deploy ke Vercel, environment variables tersebut TIDAK ADA, menyebabkan transaksi gagal dibuat.

**Evidence**: Error message yang muncul di frontend adalah "Failed to create transaction" - ini berasal dari line 126 di `route.ts`:
```typescript
return NextResponse.json(
  { error: "Failed to create transaction", details: insertError.message, ... },
  { status: 500 }
);
```

Tapi karena credentials missing, sebenarnya error yang terjadi adalah "Server configuration error - missing credentials" (line 40-43), bukan insert error.

---

### BUG 2: Missing RPC Function `add_credits_to_user`

**File**: `app/api/admin/transactions/[id]/route.ts:107`

```typescript
// Add credits to user
const { error: creditError } = await supabase.rpc("add_credits_to_user", {
  user_uuid: transaction.user_id,
  credits: transaction.total_credits,
});
```

**Problem**: Function `add_credits_to_user` **TIDAK ADA** di database!

Cek di migrations:
- `add_admin_features.sql` - ada `is_admin()` dan `log_admin_action()`
- `rombak_total_admin_panel.sql` - ada `admin_add_credits(user_uuid, credits, notes)` - NAMA BERBEDA!

Function yang benar adalah `admin_add_credits`, bukan `add_credits_to_user`.

**Impact**: Ketika admin mencoba approve transaksi, akan gagal dengan error "Function add_credits_to_user does not exist".

---

### BUG 3: Admin Role Not Assigned

**File**: `app/api/admin/transactions/route.ts:42-53`

```typescript
const { data: userData } = await supabase
  .from("users")
  .select("email, role")
  .eq("id", user.id)
  .single();

if (!userData || userData.email !== "agrianwahab10@gmail.com") {
  return NextResponse.json(
    { error: "Admin access required" },
    { status: 403 }
  );
}
```

**Problem**: Kode ini hardcoded check email `agrianwahab10@gmail.com` sebagai admin, TAPI:

1. Tidak ada di migrations yang SET role admin untuk user ini
2. Tidak ada di migrations yang membuat user ini approved

**Fix needed**: Perlu ada step untuk assign admin role ke user.

---

## Summary of Issues

| # | Bug | Severity | Location |
|---|-----|----------|----------|
| 1 | Missing env vars on Vercel (SUPABASE_URL, SERVICE_KEY) | **CRITICAL** | Vercel Dashboard |
| 2 | Wrong RPC function name `add_credits_to_user` | **HIGH** | `app/api/admin/transactions/[id]/route.ts:107` |
| 3 | Admin role not assigned to user | **MEDIUM** | Database needs setup |

---

## Fix Required

1. **Vercel Dashboard**: Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Copy values dari `.env.local`

2. **Code Fix**: Rename RPC function call:
   - `add_credits_to_user` → `admin_add_credits`

3. **Database Setup**: Assign admin role ke user agrianwahab10@gmail.com
