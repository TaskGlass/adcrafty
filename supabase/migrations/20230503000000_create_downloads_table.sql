-- Create downloads table to track user downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own downloads" 
  ON downloads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" 
  ON downloads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_created_at ON downloads(created_at);

-- Create a function to create the downloads table if it doesn't exist
CREATE OR REPLACE FUNCTION create_downloads_table()
RETURNS void AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'downloads'
  ) THEN
    -- Create the table
    CREATE TABLE downloads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Set up Row Level Security
    ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own downloads" 
      ON downloads FOR SELECT 
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own downloads" 
      ON downloads FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    -- Create index for faster lookups
    CREATE INDEX idx_downloads_user_id ON downloads(user_id);
    CREATE INDEX idx_downloads_created_at ON downloads(created_at);
  END IF;
END;
$$ LANGUAGE plpgsql;
