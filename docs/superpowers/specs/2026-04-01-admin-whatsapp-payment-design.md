# Admin Dashboard + WhatsApp Payment Design

**Created:** 2026-04-01  
**Status:** Approved  
**Feature:** Admin dashboard untuk manage users dan verifikasi pembayaran via WhatsApp

---

## 1. Overview

Sistem pembayaran manual via WhatsApp dengan admin dashboard untuk verifikasi transaksi.

### Problem Statement
- Implementasi payment gateway otomatis terlalu kompleks
- Perlu solusi sederhana untuk pembayaran via GoPay
- Admin perlu dashboard untuk manage users dan verifikasi pembayaran

### Solution
- User pilih paket → bayar via WhatsApp ke 082291134197
- Admin verifikasi bukti transfer di dashboard admin
- Kredit masuk setelah admin approve

---

## 2. User Flow

### User Flow (Customer)
```
Login → Dashboard → Top Up → Pilih Paket
  ↓
Klik "Bayar via WhatsApp" → Auto-open WA
  ↓
Kirim bukti transfer ke 082291134197
  ↓
Transaksi status: pending_verification
  ↓
Tunggu verifikasi admin
  ↓
Kredit masuk (notifikasi)
```

### Admin Flow
```
Login → /admin Dashboard
  ↓
Lihat transaksi pending
  ↓
Cek WhatsApp (bukti transfer)
  ↓
Approve/Reject transaksi
  ↓
Kredit otomatis masuk (jika approve)
```

---

## 3. Database Schema

### 3.1 Existing Tables (Modifications)

**`users` table:**
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
-- 'user' | 'admin'
-- Admin: agrianwahab10@gmail.com
```

**`transactions` table:**
```sql
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'sociabuzz',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ALTER COLUMN payment_status SET DEFAULT 'pending';
-- payment_status: 'pending' | 'pending_verification' | 'paid' | 'failed' | 'rejected'
-- payment_method: 'sociabuzz' | 'whatsapp_gopay'
```

### 3.2 New Tables

**`admin_logs` table:**
```sql
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
```

### 3.3 Row Level Security (RLS)

```sql
-- Admin logs: hanya admin yang bisa akses
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

CREATE POLICY "Admins can insert admin_logs"
  ON admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- Transactions: semua user bisa lihat milik sendiri, admin bisa lihat semua
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- Users: admin bisa lihat semua
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );
```

---

## 4. API Routes

### 4.1 GET /api/admin/users
**Purpose:** Ambil semua users untuk admin dashboard  
**Auth:** Admin only  
**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2026-04-01T00:00:00Z",
      "credit_balance": 100,
      "role": "user"
    }
  ],
  "total": 156
}
```

### 4.2 GET /api/admin/transactions
**Purpose:** Ambil semua transaksi dengan filter  
**Auth:** Admin only  
**Query Params:** `?status=pending&limit=50`  
**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_email": "user@example.com",
      "package_name": "Standard",
      "voucher_code": "VID-ABC123",
      "price": 25000,
      "payment_method": "whatsapp_gopay",
      "payment_status": "pending_verification",
      "whatsapp_number": "082291134197",
      "created_at": "2026-04-01T00:00:00Z"
    }
  ],
  "total": 48
}
```

### 4.3 PATCH /api/admin/transactions/[id]
**Purpose:** Approve/reject transaksi  
**Auth:** Admin only  
**Body:**
```json
{
  "action": "approve", // atau "reject"
  "reason": "Transfer verified" // untuk reject
}
```
**Response:**
```json
{
  "success": true,
  "transaction": { ... },
  "credits_added": 300
}
```

### 4.4 GET /api/admin/stats
**Purpose:** Statistik dashboard  
**Auth:** Admin only  
**Response:**
```json
{
  "total_users": 156,
  "total_transactions": 48,
  "pending_verification": 5,
  "total_revenue": 1250000,
  "revenue_this_month": 450000
}
```

---

## 5. Frontend Pages

### 5.1 /admin (Dashboard)
**Components:**
- AdminStats (4 cards: Users, Transactions, Pending, Revenue)
- RecentActivity (last 10 transactions)
- QuickActions (navigate to users/transactions)

### 5.2 /admin/users
**Components:**
- UsersHeader (title, search, filters)
- UsersTable (sortable, searchable)

**Columns:**
- Email
- Name
- Joined Date
- Credit Balance
- Role
- Actions (view detail)

### 5.3 /admin/transactions
**Components:**
- TransactionsHeader (title, status filter)
- TransactionsTable (dengan action buttons)

**Columns:**
- User (email)
- Package
- Voucher Code
- Price
- Payment Method
- Status (badge color)
- Created At
- Actions (Approve, Reject, View)

**Actions:**
- Approve: Update status → paid, add credits, log action
- Reject: Update status → rejected, optional reason
- View: Modal dengan detail lengkap

### 5.4 /dashboard/topup (Update)
**New Feature:** WhatsApp payment button

**Template Message:**
```
Halo, saya ingin top up kredit Vidsense AI.

📦 Paket: {packageName}
💰 Harga: Rp {price}
🎫 Kode Voucher: {voucherCode}
👤 Email: {userEmail}

Saya akan kirim bukti transfer via chat ini. Terima kasih!
```

**Dialog:**
- Package summary
- Voucher code (copyable)
- Instructions (step-by-step)
- Button: "Bayar via WhatsApp" → wa.me/6282291134197?text=...

---

## 6. Security & Authorization

### 6.1 Middleware Protection
```typescript
// middleware.ts
const adminRoutes = ['/admin'];

if (adminRoutes.some(route => pathname.startsWith(route))) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.email !== 'agrianwahab10@gmail.com') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

### 6.2 API Route Protection
```typescript
// api/admin/*/route.ts
const { data: { user } } = await supabase.auth.getUser();

if (!user || user.email !== 'agrianwahab10@gmail.com') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 6.3 Database RLS
- Admin tables: hanya admin email yang bisa akses
- Transactions: user bisa lihat milik sendiri, admin bisa lihat semua

---

## 7. File Structure

```
app/
├── admin/
│   ├── layout.tsx                  # Admin layout
│   ├── page.tsx                    # Dashboard
│   ├── users/
│   │   └── page.tsx                # Users management
│   └── transactions/
│       └── page.tsx                # Transaction verification
│
├── api/
│   └── admin/
│       ├── users/
│       │   └── route.ts
│       ├── transactions/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── stats/
│           └── route.ts
│
components/
├── admin/
│   ├── admin-dashboard-layout.tsx
│   ├── admin-stats.tsx
│   ├── users-table.tsx
│   ├── users-header.tsx
│   ├── transactions-table.tsx
│   └── transactions-header.tsx
│
middleware.ts (updated)
```

---

## 8. Implementation Steps

### Phase 1: Database Setup
- [ ] Create migration: `add_admin_features.sql`
- [ ] Run migration di Supabase
- [ ] Verify RLS policies

### Phase 2: API Routes
- [ ] `/api/admin/stats` - Statistics endpoint
- [ ] `/api/admin/users` - Users list endpoint
- [ ] `/api/admin/transactions` - Transactions list endpoint
- [ ] `/api/admin/transactions/[id]` - Approve/reject endpoint

### Phase 3: Admin Components
- [ ] `admin-dashboard-layout.tsx` - Sidebar navigation
- [ ] `admin-stats.tsx` - Statistics cards
- [ ] `users-table.tsx` - Users table component
- [ ] `users-header.tsx` - Users page header
- [ ] `transactions-table.tsx` - Transactions table with actions
- [ ] `transactions-header.tsx` - Transactions page header

### Phase 4: Admin Pages
- [ ] `/admin/layout.tsx` - Admin layout
- [ ] `/admin/page.tsx` - Dashboard page
- [ ] `/admin/users/page.tsx` - Users management page
- [ ] `/admin/transactions/page.tsx` - Transaction verification page

### Phase 5: Security
- [ ] Update `middleware.ts` - Protect /admin routes
- [ ] Add auth checks to all API routes
- [ ] Test RLS policies

### Phase 6: WhatsApp Integration
- [ ] Update `/dashboard/topup/page.tsx` - Add WhatsApp button
- [ ] Generate voucher code flow
- [ ] WhatsApp message template
- [ ] Dialog dengan instruksi

### Phase 7: Testing
- [ ] Test admin access (only agrianwahab10@gmail.com)
- [ ] Test user cannot access /admin
- [ ] Test transaction approval flow
- [ ] Test credit addition
- [ ] Test WhatsApp message generation

### Phase 8: Deployment
- [ ] Commit changes to GitHub
- [ ] Trigger Vercel deployment
- [ ] Verify deployment
- [ ] Test production environment

---

## 9. Acceptance Criteria

### Admin Dashboard
- ✅ Hanya `agrianwahab10@gmail.com` yang bisa akses
- ✅ Menampilkan statistik (users, transaksi, pending, revenue)
- ✅ Real-time data dari Supabase

### Users Management
- ✅ Tabel semua users dengan search/filter
- ✅ Menampilkan: email, nama, join date, credit balance
- ✅ Sortable columns

### Transaction Verification
- ✅ Tabel transaksi dengan filter status
- ✅ Button Approve → update status + add credits
- ✅ Button Reject → update status + optional reason
- ✅ Log semua aksi admin

### WhatsApp Payment
- ✅ User bisa generate voucher code
- ✅ Button "Bayar via WhatsApp" dengan template message
- ✅ Instruksi jelas untuk user
- ✅ Transaksi status: pending_verification

### Security
- ✅ Middleware protection untuk /admin
- ✅ API route authentication
- ✅ Database RLS policies
- ✅ No unauthorized access

---

## 10. Notes & Considerations

### Manual Process Trade-off
- **Pro:** Simple, no payment gateway integration
- **Con:** Requires manual verification, slower than automated

### Future Improvements
- Automated payment gateway (Midtrans, Xendit)
- Upload bukti transfer langsung di app
- Email notifications
- Bulk approval untuk multiple transactions

### WhatsApp Business API
- Current: Personal WhatsApp (manual)
- Future: WhatsApp Business API untuk automated messages

---

## 11. Testing Checklist

- [ ] Admin login dengan agrianwahab10@gmail.com
- [ ] User biasa tidak bisa akses /admin
- [ ] Generate voucher code berfungsi
- [ ] WhatsApp message template benar
- [ ] Approve transaksi → kredit masuk
- [ ] Reject transaksi → status update
- [ ] Stats dashboard akurat
- [ ] Users table menampilkan data
- [ ] Transactions table menampilkan data
- [ ] Search/filter berfungsi
- [ ] Mobile responsive

---

**Status:** ✅ APPROVED - Ready for implementation
