-- Rombak Total: Admin Panel & User Management
-- Run setelah: add_admin_features.sql dan add_admin_rls_policies.sql

-- ============================================================================
-- 1. UPDATE USERS TABLE - Add approval & suspension columns
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);

COMMENT ON COLUMN users.is_approved IS 'Admin approval status for new users';
COMMENT ON COLUMN users.is_suspended IS 'Suspension status (stop langganan)';
COMMENT ON COLUMN users.suspension_reason IS 'Reason for suspension';
COMMENT ON COLUMN users.approved_by IS 'Admin who approved this user';
COMMENT ON COLUMN users.approved_at IS 'When user was approved';
COMMENT ON COLUMN users.suspended_at IS 'When user was suspended';

-- ============================================================================
-- 2. SIMPLIFY TRANSACTIONS TABLE - Remove unnecessary columns
-- ============================================================================

-- Add payment_proof_image_url for WhatsApp transfer proof
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_proof_image_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

COMMENT ON COLUMN transactions.payment_proof_image_url IS 'URL to transfer proof image';
COMMENT ON COLUMN transactions.admin_notes IS 'Admin notes for verification';

-- ============================================================================
-- 3. CREATE FUNCTION: Approve User
-- ============================================================================

CREATE OR REPLACE FUNCTION approve_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Check if current user is admin
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'agrianwahab10@gmail.com' THEN
    RAISE EXCEPTION 'Only admin can approve users';
  END IF;
  
  -- Update user
  UPDATE users
  SET 
    is_approved = true,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = user_uuid;
  
  -- Log action
  INSERT INTO admin_logs (admin_id, action, target_id, metadata)
  VALUES (
    auth.uid(),
    'approve_user',
    user_uuid,
    jsonb_build_object('action', 'approve_user', 'user_id', user_uuid)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CREATE FUNCTION: Suspend/Unsuspend User
-- ============================================================================

CREATE OR REPLACE FUNCTION suspend_user(user_uuid UUID, reason TEXT DEFAULT 'No reason provided')
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Check if current user is admin
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'agrianwahab10@gmail.com' THEN
    RAISE EXCEPTION 'Only admin can suspend users';
  END IF;
  
  -- Suspend user
  UPDATE users
  SET 
    is_suspended = true,
    suspension_reason = reason,
    suspended_at = NOW()
  WHERE id = user_uuid;
  
  -- Log action
  INSERT INTO admin_logs (admin_id, action, target_id, metadata)
  VALUES (
    auth.uid(),
    'suspend_user',
    user_uuid,
    jsonb_build_object('action', 'suspend_user', 'user_id', user_uuid, 'reason', reason)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unsuspend_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Check if current user is admin
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'agrianwahab10@gmail.com' THEN
    RAISE EXCEPTION 'Only admin can unsuspend users';
  END IF;
  
  -- Unsuspend user
  UPDATE users
  SET 
    is_suspended = false,
    suspension_reason = NULL,
    suspended_at = NULL
  WHERE id = user_uuid;
  
  -- Log action
  INSERT INTO admin_logs (admin_id, action, target_id, metadata)
  VALUES (
    auth.uid(),
    'unsuspend_user',
    user_uuid,
    jsonb_build_object('action', 'unsuspend_user', 'user_id', user_uuid)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CREATE FUNCTION: Add Credits to User (Admin Manual)
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_add_credits(user_uuid UUID, credits INTEGER, notes TEXT DEFAULT '')
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Check if current user is admin
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'agrianwahab10@gmail.com' THEN
    RAISE EXCEPTION 'Only admin can add credits';
  END IF;
  
  -- Add credits
  UPDATE users
  SET credit_balance = credit_balance + credits
  WHERE id = user_uuid;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    order_id,
    package_name,
    credits_amount,
    total_credits,
    price,
    payment_method,
    payment_status,
    admin_notes
  ) VALUES (
    user_uuid,
    'ADMIN-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'Manual Credit',
    credits,
    credits,
    0,
    'admin_grant',
    'paid',
    notes
  );
  
  -- Log action
  INSERT INTO admin_logs (admin_id, action, target_id, metadata)
  VALUES (
    auth.uid(),
    'add_credits',
    user_uuid,
    jsonb_build_object('action', 'add_credits', 'user_id', user_uuid, 'credits', credits, 'notes', notes)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE FUNCTION: Delete User (Soft Delete Option)
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user(user_uuid UUID, hard_delete BOOLEAN DEFAULT false)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Check if current user is admin
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'agrianwahab10@gmail.com' THEN
    RAISE EXCEPTION 'Only admin can delete users';
  END IF;
  
  IF hard_delete THEN
    -- Hard delete: permanently remove user and all data
    DELETE FROM transactions WHERE user_id = user_uuid;
    DELETE FROM users WHERE id = user_uuid;
    
    -- Log action
    INSERT INTO admin_logs (admin_id, action, target_id, metadata)
    VALUES (
      auth.uid(),
      'hard_delete_user',
      user_uuid,
      jsonb_build_object('action', 'hard_delete_user', 'user_id', user_uuid)
    );
  ELSE
    -- Soft delete: mark as deleted but keep data
    UPDATE users
    SET 
      is_suspended = true,
      suspension_reason = 'Account deleted by admin',
      suspended_at = NOW()
    WHERE id = user_uuid;
    
    -- Log action
    INSERT INTO admin_logs (admin_id, action, target_id, metadata)
    VALUES (
      auth.uid(),
      'soft_delete_user',
      user_uuid,
      jsonb_build_object('action', 'soft_delete_user', 'user_id', user_uuid)
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. UPDATE RLS POLICIES
-- ============================================================================

-- Users: Only approved and non-suspended users can access dashboard
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (
    auth.uid() = id 
    AND is_approved = true 
    AND is_suspended = false
  );

-- Users: Admin can view all (including unapproved and suspended)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'agrianwahab10@gmail.com'
    )
  );

-- ============================================================================
-- 8. HELPER: Set default values for existing users
-- ============================================================================

-- Mark all existing users as approved and not suspended
UPDATE users 
SET 
  is_approved = COALESCE(is_approved, true),
  is_suspended = COALESCE(is_suspended, false)
WHERE is_approved IS NULL OR is_suspended IS NULL;

-- ============================================================================
-- 9. TESTING QUERIES
-- ============================================================================

/*
-- Test approve user
SELECT approve_user('user-uuid-here');

-- Test suspend user
SELECT suspend_user('user-uuid-here', 'Violation of terms');

-- Test unsuspend user
SELECT unsuspend_user('user-uuid-here');

-- Test add credits
SELECT admin_add_credits('user-uuid-here', 500, 'Bonus for loyal user');

-- Test delete user (soft)
SELECT delete_user('user-uuid-here', false);

-- Test delete user (hard)
SELECT delete_user('user-uuid-here', true);

-- Check users status
SELECT id, email, is_approved, is_suspended, suspension_reason, credit_balance 
FROM users;
*/
