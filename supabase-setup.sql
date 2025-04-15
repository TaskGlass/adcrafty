-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ads" 
  ON ads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads" 
  ON ads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" 
  ON ads FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" 
  ON ads FOR DELETE 
  USING (auth.uid() = user_id);
