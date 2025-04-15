// This is a utility script to create the subscriptions table in Supabase
// Run this script with: npx ts-node scripts/create-subscriptions-table.ts

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // This requires the service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSubscriptionsTable() {
  console.log("Creating subscriptions table...")

  // Check if table already exists
  const { error: checkError } = await supabase.from("subscriptions").select("count").limit(1).single()

  if (!checkError) {
    console.log("Subscriptions table already exists.")
    return
  }

  // Create the table
  const { error: createError } = await supabase.rpc("create_subscriptions_table", {})

  if (createError) {
    console.error("Error creating table:", createError)

    // Try creating the table with raw SQL
    console.log("Trying to create table with raw SQL...")

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        plan TEXT NOT NULL DEFAULT 'free',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can view their own subscriptions" 
        ON subscriptions FOR SELECT 
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own subscriptions" 
        ON subscriptions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update their own subscriptions" 
        ON subscriptions FOR UPDATE 
        USING (auth.uid() = user_id);

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    `

    // Note: This would require the ability to execute raw SQL, which might not be available
    // in all Supabase plans or might require additional permissions
    console.log("Please run the following SQL in your Supabase SQL editor:")
    console.log(createTableSQL)
  } else {
    console.log("Subscriptions table created successfully!")
  }
}

createSubscriptionsTable()
  .catch(console.error)
  .finally(() => process.exit(0))
