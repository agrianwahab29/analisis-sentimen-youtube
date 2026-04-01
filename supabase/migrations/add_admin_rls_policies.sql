-- RLS Policies for Admin Dashboard
-- Run after: add_admin_features.sql

-- ============================================================================
-- 1. ADMIN_LOGS TABLE - Row Level Security
-- ============================================================================

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin_logs
CREATE POLICY "Admins can view all admin_logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- Policy: Only admins can insert admin_logs
CREATE POLICY "Only admins can insert admin_logs"
  ON admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- ============================================================================
-- 2. TRANSACTIONS TABLE - Row Level Security
-- ============================================================================

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- Policy: Admins can update all transactions (for verification)
CREATE POLICY "Admins can update all transactions"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- ============================================================================
-- 3. USERS TABLE - Row Level Security
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 4. HELPER: Set Admin Role for Existing User
-- ============================================================================

-- Uncomment and run this to set your admin role
-- Replace with your actual email if different
/*
UPDATE users 
SET role = 'admin' 
WHERE email = 'agrianwahab10@gmail.com';

-- Verify
SELECT id, email, role FROM users WHERE role = 'admin';
*/

-- ============================================================================
-- 5. TESTING QUERIES
-- ============================================================================

-- Test if current user is admin (should return true for admin user)
-- SELECT is_admin();

-- Test RLS: Non-admin should not see admin_logs
-- Test RLS: Admin should see all admin_logs

COMMENT ON COLUMN users.role IS 'User role: user or admin (admin = agrianwahab10@gmail.com)';
COMMENT ON COLUMN transactions.payment_method IS 'Payment method: sociabuzz or whatsapp_gopay';
COMMENT ON COLUMN transactions.whatsapp_number IS 'WhatsApp number for manual payments';
COMMENT ON COLUMN transactions.proof_image_url IS 'URL to transfer proof image in Supabase Storage';
COMMENT ON COLUMN transactions.verified_by IS 'Admin user ID who verified the payment';
COMMENT ON COLUMN transactions.verified_at IS 'Timestamp when payment was verified';
