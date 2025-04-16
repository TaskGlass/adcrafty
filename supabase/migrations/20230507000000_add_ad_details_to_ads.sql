-- Add new columns to ads table for enhanced ad details
ALTER TABLE ads ADD COLUMN IF NOT EXISTS ad_tone TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS ad_cta TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS ad_offer TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS ad_points TEXT[];
