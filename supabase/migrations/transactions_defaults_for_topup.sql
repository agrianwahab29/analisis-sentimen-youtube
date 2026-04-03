-- Make top-up inserts resilient to missing fields.
-- If code paths accidentally omit required columns (type/amount),
-- these defaults prevent NOT NULL constraint failures and stop 500 loops.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'transactions'
      AND column_name = 'amount'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN amount SET DEFAULT 0;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'transactions'
      AND column_name = 'type'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN type SET DEFAULT 'topup';
  END IF;
END $$;

