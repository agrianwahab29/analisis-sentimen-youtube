-- Helper for debugging: exposes the DB CHECK constraint definition for transactions.type
-- so application code can use correct allowed values.

CREATE OR REPLACE FUNCTION public.debug_transactions_type_check()
RETURNS TABLE (
  conname TEXT,
  condef TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.conname,
    pg_get_constraintdef(c.oid) AS condef
  FROM pg_constraint c
  WHERE c.conname = 'transactions_type_check';
END;
$$;

