-- Migration: Add freon column to splits table
-- Adds freon refrigerant type column with enum options R22, R410a

ALTER TABLE splits ADD COLUMN IF NOT EXISTS freon VARCHAR(50) NULL COMMENT 'Refrigerant type: R22 or R410a';

-- Create index for freon column
CREATE INDEX IF NOT EXISTS idx_splits_freon ON splits(freon);
