-- Ensure transactions table has all columns required by:
-- - POST /api/topup/generate (create pending transaction with voucher_code & whatsapp_number)
-- - POST /api/topup/callback (mark paid, update sociabuzz fields)
-- - PATCH /api/admin/transactions/[id] (approve/reject with verified_by/verified_at/paid_at)
--
-- This prevents recurring 500 on insert when some columns are missing in a given environment.

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS voucher_code TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS package_id TEXT,
  ADD COLUMN IF NOT EXISTS package_name TEXT,
  ADD COLUMN IF NOT EXISTS credits_amount INTEGER,
  ADD COLUMN IF NOT EXISTS bonus_credits INTEGER,
  ADD COLUMN IF NOT EXISTS total_credits INTEGER,
  ADD COLUMN IF NOT EXISTS sociabuzz_order_id TEXT,
  ADD COLUMN IF NOT EXISTS sociabuzz_response JSONB,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Keep app-compatible defaults if columns already exist.
ALTER TABLE transactions
  ALTER COLUMN payment_status SET DEFAULT 'pending';

