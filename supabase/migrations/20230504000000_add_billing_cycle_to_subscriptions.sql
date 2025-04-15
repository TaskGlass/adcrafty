-- Add billing_cycle column to subscriptions table
ALTER TABLE IF EXISTS subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly';

-- Create a function to update the billing cycle
CREATE OR REPLACE FUNCTION update_subscription_billing_cycle(
  p_user_id UUID,
  p_billing_cycle TEXT
) RETURNS VOID AS $
BEGIN
  UPDATE subscriptions
  SET 
    billing_cycle = p_billing_cycle,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$ LANGUAGE plpgsql;
