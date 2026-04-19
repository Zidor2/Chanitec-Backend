-- Migration to ensure quotes table has all required columns
-- This migration aligns with actual database structure

-- Add missing columns if they don't exist
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS HBC FLOAT DEFAULT 0.00;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS confirmed TINYINT(1) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS split_id VARCHAR(50) NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS number_chanitec INT NULL;

-- Add comments to document the columns
ALTER TABLE quotes MODIFY COLUMN HBC FLOAT DEFAULT 0.00 COMMENT 'Percentage-based adjustment applied after remise';
ALTER TABLE quotes MODIFY COLUMN confirmed TINYINT(1) DEFAULT 0 COMMENT 'Whether the quote has been confirmed';
ALTER TABLE quotes MODIFY COLUMN split_id VARCHAR(50) COMMENT 'Reference to split/group ID';
ALTER TABLE quotes MODIFY COLUMN number_chanitec INT COMMENT 'Chanitec order number';

-- Add internal_id if it doesn't exist (auto-increment primary key)
-- Note: This assumes the table doesn't already have this. If migrating, this may need manual intervention.
-- ALTER TABLE quotes ADD COLUMN internal_id INT AUTO_INCREMENT UNIQUE FIRST;
