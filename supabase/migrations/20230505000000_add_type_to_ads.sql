-- Add type column to ads table
ALTER TABLE ads ADD COLUMN type TEXT NOT NULL DEFAULT 'image';

-- Update existing ads to have the image type
UPDATE ads SET type = 'image';
