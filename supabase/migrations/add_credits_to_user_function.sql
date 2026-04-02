-- Migration: Add credits function for webhook/service-role usage
-- Description: Creates add_credits_to_user() for non-session contexts (webhook, admin API)
--              and adds service-role INSERT policy on admin_logs
-- Created: 2026-04-02
-- Run setelah: add_admin_features.sql, add_admin_rls_policies.sql, rombak_total_admin_panel.sql

-- ============================================================================
-- 1. CREATE FUNCTION: add_credits_to_user
-- ============================================================================
-- Unlike admin_add_credits, this function:
--   - Does NOT check auth.uid() — called from webhook (no user session) and admin API (service role)
--   - Does NOT insert into transactions table — handled at API layer
--   - Uses SECURITY DEFINER so it works with service role key
-- ============================================================================

CREATE OR REPLACE FUNCTION add_credits_to_user(user_uuid UUID, credits INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET credit_balance = credit_balance + credits
  WHERE id = user_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_credits_to_user IS
  'Adds credits to a user''s balance. Intended for webhook and service-role calls. Transaction logging is handled at the API layer.';

-- ============================================================================
-- 2. ADD RLS POLICY: Service-role INSERT on admin_logs
-- ============================================================================
-- The existing admin_logs_insert_policy uses is_admin() which checks auth.uid().
-- Service role calls bypass auth.uid(), so we need a separate policy.
-- This policy allows inserts when the caller uses the service_role key.
-- ============================================================================

CREATE POLICY admin_logs_service_insert ON admin_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON POLICY admin_logs_service_insert ON admin_logs IS
  'Allows service role to INSERT into admin_logs (webhook / admin API contexts where auth.uid() is unavailable)';
