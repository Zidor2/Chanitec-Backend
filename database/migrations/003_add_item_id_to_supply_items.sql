-- Add item_id column to supply_items table
ALTER TABLE supply_items ADD COLUMN item_id CHAR(36) AFTER quote_id;