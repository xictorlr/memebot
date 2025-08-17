/*
  # Add user_id column to trading_performance table

  1. Changes
    - Add user_id column to trading_performance table
    - Add foreign key constraint to users table
    - Update RLS policies to include user-specific access
    - Add index for better performance

  2. Security
    - Enable RLS on trading_performance table
    - Add policies for user-specific access
*/

-- Add user_id column to trading_performance table
ALTER TABLE trading_performance 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trading_performance_user_id 
ON trading_performance(user_id);

-- Update RLS policies to include user-specific access
DROP POLICY IF EXISTS "Public can read trading performance" ON trading_performance;

-- Add new policies for user-specific access
CREATE POLICY "Users can read own trading performance"
  ON trading_performance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trading performance"
  ON trading_performance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading performance"
  ON trading_performance
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep public read access for general statistics (without user_id filter)
CREATE POLICY "Public can read general trading performance"
  ON trading_performance
  FOR SELECT
  TO public
  USING (user_id IS NULL);

-- Allow system to insert general performance data
CREATE POLICY "System can insert general trading performance"
  ON trading_performance
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL);