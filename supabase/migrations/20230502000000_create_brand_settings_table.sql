-- Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  brand_tone TEXT,
  brand_voice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own brand settings" 
  ON brand_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand settings" 
  ON brand_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand settings" 
  ON brand_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_brand_settings_user_id ON brand_settings(user_id);

-- Create a function to handle upserts
CREATE OR REPLACE FUNCTION upsert_brand_settings(
  p_user_id UUID,
  p_logo_url TEXT,
  p_primary_color TEXT,
  p_secondary_color TEXT,
  p_accent_color TEXT,
  p_brand_tone TEXT,
  p_brand_voice TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO brand_settings (
    user_id, 
    logo_url, 
    primary_color, 
    secondary_color, 
    accent_color, 
    brand_tone, 
    brand_voice
  ) 
  VALUES (
    p_user_id, 
    p_logo_url, 
    p_primary_color, 
    p_secondary_color, 
    p_accent_color, 
    p_brand_tone, 
    p_brand_voice
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    logo_url = p_logo_url,
    primary_color = p_primary_color,
    secondary_color = p_secondary_color,
    accent_color = p_accent_color,
    brand_tone = p_brand_tone,
    brand_voice = p_brand_voice,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
