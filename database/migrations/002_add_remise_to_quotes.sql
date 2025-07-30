-- Migration to add remise column to quotes table
-- remise represents a discount/rebate amount

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS remise DECIMAL(10, 2) DEFAULT 0.00;

-- Add comment to document the column
ALTER TABLE quotes MODIFY COLUMN remise DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Discount/rebate amount applied to the quote'; 