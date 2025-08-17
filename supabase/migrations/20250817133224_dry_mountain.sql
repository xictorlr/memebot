/*
  # Fix Trading Actions RLS - Simple Public Access
  
  1. Security
    - Public read access for all trading signals
    - No user_id column needed - these are system-generated signals
    - Simple RLS policies for public data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read trading actions" ON trading_actions;
DROP POLICY IF EXISTS "Users can insert own trading actions" ON trading_actions;
DROP POLICY IF EXISTS "System can insert trading actions" ON trading_actions;

-- Enable RLS
ALTER TABLE trading_actions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all trading signals
CREATE POLICY "Public can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

-- Allow system to insert trading actions (for GitHub Actions)
CREATE POLICY "System can insert trading actions"
  ON trading_actions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);