/*
  # Fix Trading Actions RLS - Add missing user_id column

  1. Add user_id column to trading_actions table
  2. Update RLS policies to work with the new column
  3. Allow public read access for trading signals
  4. Require authentication for writing trading actions
*/

-- First, add the user_id column to trading_actions table
ALTER TABLE trading_actions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trading_actions_user_id ON trading_actions(user_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read trading actions" ON trading_actions;
DROP POLICY IF EXISTS "Users can insert own trading actions" ON trading_actions;

-- Create new RLS policies
CREATE POLICY "Public can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert trading actions"
  ON trading_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Ensure RLS is enabled
ALTER TABLE trading_actions ENABLE ROW LEVEL SECURITY;

-- Update trading_performance policies as well
DROP POLICY IF EXISTS "Public can read trading performance" ON trading_performance;
DROP POLICY IF EXISTS "Users can manage own trading performance" ON trading_performance;

CREATE POLICY "Public can read trading performance"
  ON trading_performance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage own trading performance"
  ON trading_performance
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Ensure RLS is enabled on trading_performance
ALTER TABLE trading_performance ENABLE ROW LEVEL SECURITY;