-- Migration: Add Admin Features
-- Description: Adds admin role management, enhanced payment tracking, and admin audit logging
-- Created: 2026-04-01
-- Spec: docs/superpowers/specs/2026-04-01-admin-whatsapp-payment-design.md

-- ============================================================================
-- 1. MODIFY USERS TABLE
-- ============================================================================

-- Add role column for role-based access control
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

COMMENT ON COLUMN users.role IS 'User role for access control: user | admin';

-- ============================================================================
-- 2. MODIFY TRANSACTIONS TABLE
-- ============================================================================

-- Add payment_method column
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'sociabuzz' CHECK (payment_method IN ('sociabuzz', 'whatsapp_gopay'));

COMMENT ON COLUMN transactions.payment_method IS 'Payment method used: sociabuzz | whatsapp_gopay';

-- Add whatsapp_number column
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

COMMENT ON COLUMN transactions.whatsapp_number IS 'User WhatsApp number for whatsapp_gopay payment method';

-- Add proof_image_url column (optional)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

COMMENT ON COLUMN transactions.proof_image_url IS 'URL to uploaded transfer proof image (required for whatsapp_gopay)';

-- Add verified_by column (admin who verified the transaction)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN transactions.verified_by IS 'UUID of admin user who verified this transaction';

-- Add verified_at column
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN transactions.verified_at IS 'Timestamp when transaction was verified by admin';

-- Update payment_status default and add check constraint
-- First, drop existing default if any
ALTER TABLE transactions
ALTER COLUMN payment_status SET DEFAULT 'pending';

-- Add check constraint for payment_status values (drop existing if needed first)
DO $$
BEGIN
  -- Try to drop existing constraint if it exists
  BEGIN
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_status_check;
  EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
  
  -- Add new check constraint
  ALTER TABLE transactions
  ADD CONSTRAINT transactions_payment_status_check
  CHECK (payment_status IN ('pending', 'pending_verification', 'paid', 'failed', 'rejected'));
END $$;

COMMENT ON COLUMN transactions.payment_status IS 'Transaction payment status: pending | pending_verification | paid | failed | rejected';

-- ============================================================================
-- 3. CREATE ADMIN_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE admin_logs IS 'Audit log table for tracking admin actions and system events';
COMMENT ON COLUMN admin_logs.id IS 'Unique identifier for the log entry';
COMMENT ON COLUMN admin_logs.admin_id IS 'UUID of admin user who performed the action';
COMMENT ON COLUMN admin_logs.action IS 'Type of action performed (e.g., verify_transaction, reject_user, update_settings)';
COMMENT ON COLUMN admin_logs.target_id IS 'UUID of the target entity affected by the action (if applicable)';
COMMENT ON COLUMN admin_logs.metadata IS 'Additional JSONB data related to the action';
COMMENT ON COLUMN admin_logs.created_at IS 'Timestamp when the action was performed';

-- ============================================================================
-- 4. CREATE INDEXES
-- ============================================================================

-- Index on admin_logs for efficient admin-specific queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- Index on admin_logs for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Index on transactions for payment status filtering (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);

-- Index on transactions for user-specific queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS (OPTIONAL BUT RECOMMENDED)
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Returns true if current authenticated user has admin role';

-- Function to log admin actions (can be called from RLS policies or triggers)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), p_action, p_target_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_admin_action IS 'Helper function to create admin log entries';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY admin_logs_view_policy ON admin_logs
  FOR SELECT
  USING (is_admin());

-- Policy: Only admins can insert logs (via helper function)
CREATE POLICY admin_logs_insert_policy ON admin_logs
  FOR INSERT
  WITH CHECK (is_admin());

-- Policy: Admins can only view their own logs (additional restriction)
-- Note: This is redundant with the first policy but provides defense in depth
-- CREATE POLICY admin_logs_own_logs_policy ON admin_logs
--   FOR SELECT
--   USING (admin_id = auth.uid());

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, UUID, JSONB) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Manual Steps Required After Migration:
-- 1. Set admin role for specific user(s):
--    UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
--
-- 2. Verify the migration:
--    SELECT * FROM users WHERE role = 'admin';
--    SELECT * FROM admin_logs LIMIT 10;
--
-- 3. Test RLS policies by logging in as non-admin user
--
-- 4. Configure Supabase Storage bucket for proof_image_url uploads (if not already done)
