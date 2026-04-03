-- Fix saldo UI vs DB mismatch: RLS previously required is_approved + not suspended for SELECT,
-- so /api/auth/session and other JWT reads got no row and showed credit_balance as 0.
-- Users may always read their own profile row; approval/suspension should gate routes in app logic if needed.

DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

COMMENT ON POLICY "Users can view own profile" ON users IS
  'Authenticated user can read their own users row (incl. credit_balance).';
