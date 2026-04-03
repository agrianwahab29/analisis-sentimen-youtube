-- Fix transactions.type default for top-up inserts.
-- The schema constraint transactions_type_check only allows:
--   'topup' | 'analysis' | 'refund'
-- If the previous migration set a different default (e.g. 'credit_purchase'),
-- future inserts that omit `type` would fail.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'transactions'
      AND column_name = 'type'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN type SET DEFAULT 'topup';
  END IF;
END $$;

