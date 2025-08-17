/*
  # Add user_id column to trading_actions table

  1. Changes
    - Add user_id column to trading_actions table
    - Add foreign key constraint to auth.users
    - Update RLS policies to allow public read and authenticated write
    - Add index for better performance

  2. Security
    - Public can read all trading actions (for displaying signals)
    - Only authenticated users can insert their own actions
    - System can insert actions without user_id (from GitHub Actions)
*/

-- Add user_id column to trading_actions table
ALTER TABLE trading_actions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_trading_actions_user_id 
ON trading_actions(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Public can read trading actions" ON trading_actions;
DROP POLICY IF EXISTS "Users can manage own trading rules" ON trading_actions;

-- Create new RLS policies
CREATE POLICY "Anyone can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert trading actions"
  ON trading_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert trading actions"
  ON trading_actions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);