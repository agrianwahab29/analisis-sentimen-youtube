-- Add INSERT policy for transactions table
-- This allows authenticated users to create their own transactions

-- First, check if RLS is enabled on transactions table
-- If not, enable it
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own transactions
-- This is needed for the topup flow where users create transaction records
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can always insert (bypasses RLS)
-- This is handled automatically by Supabase when using service_role key

-- Verify the policy was created
-- SELECT * FROM pg_policies WHERE tablename = 'transactions';

COMMENT ON POLICY "Users can insert own transactions" ON transactions 
IS 'Allows authenticated users to create transactions for themselves (topup flow)';