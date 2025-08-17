/*
  # Add user_id column to trading_actions table

  1. Changes
    - Add user_id column to existing trading_actions table
    - Add foreign key constraint to auth.users
    - Update RLS policies to use user_id
    - Add index for performance

  2. Security
    - Public can read all trading actions
    - Authenticated users can insert their own actions
    - System can insert actions without user_id (GitHub Actions)
*/

-- Add user_id column to existing trading_actions table
ALTER TABLE trading_actions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_trading_actions_user_id 
ON trading_actions(user_id);

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Public can read trading actions" ON trading_actions;
DROP POLICY IF EXISTS "Users can insert own actions" ON trading_actions;
DROP POLICY IF EXISTS "System can insert actions" ON trading_actions;

-- Enable RLS
ALTER TABLE trading_actions ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Public can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert own actions"
  ON trading_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert actions"
  ON trading_actions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);