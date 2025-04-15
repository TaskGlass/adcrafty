-- Add ad_copy column to ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS ad_copy JSONB;
