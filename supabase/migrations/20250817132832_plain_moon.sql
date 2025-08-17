/*
  # Fix trading actions RLS policies

  1. Security Updates
    - Allow public read access to trading_actions (for displaying signals)
    - Keep insert/update/delete restricted to authenticated users
    - Update trading_performance policies for user-specific data
  
  2. Changes
    - Modified RLS policies to allow public SELECT on trading_actions
    - Ensured proper user_id handling for authenticated operations
*/

-- Update trading_actions policies to allow public read access
DROP POLICY IF EXISTS "Public can read trading actions" ON trading_actions;
CREATE POLICY "Public can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

-- Keep insert/update/delete restricted to authenticated users with proper user_id
DROP POLICY IF EXISTS "Authenticated users can insert trading actions" ON trading_actions;
CREATE POLICY "Authenticated users can insert trading actions"
  ON trading_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update trading_performance policies
DROP POLICY IF EXISTS "Users can manage own trading performance" ON trading_performance;
CREATE POLICY "Users can read own trading performance"
  ON trading_performance
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trading performance"
  ON trading_performance
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trading performance"
  ON trading_performance
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add user_id column to trading_actions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trading_actions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE trading_actions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;