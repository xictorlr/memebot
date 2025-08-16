/*
  # Fix existing triggers and user profile creation

  1. Issues Fixed
    - Handle existing update_updated_at function properly
    - Fix create_user_profile trigger function
    - Ensure proper RLS policies
    - Add missing user profile creation logic

  2. Changes
    - Replace create_user_profile function with proper error handling
    - Keep existing update_updated_at function intact
    - Add proper user profile creation on signup
    - Fix any missing RLS policies
*/

-- First, let's fix the create_user_profile function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (
      user_id,
      username,
      telegram_chat_id,
      telegram_bot_token,
      alerts_enabled,
      alert_frequency
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, 'user'),
      '5441177022',
      '8486768601:AAF9_1rbGsJ-r7Zq-y4lnt08QeAxAOBVFG0',
      true,
      5
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the signup
      RAISE WARNING 'Could not create user profile: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Make sure RLS is enabled on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Ensure proper RLS policies exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure other tables have proper RLS
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Fix any missing policies for watchlists
DROP POLICY IF EXISTS "Users can manage own watchlists" ON watchlists;
CREATE POLICY "Users can manage own watchlists"
  ON watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix any missing policies for trading_rules
DROP POLICY IF EXISTS "Users can manage own trading rules" ON trading_rules;
CREATE POLICY "Users can manage own trading rules"
  ON trading_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix any missing policies for portfolio_entries
DROP POLICY IF EXISTS "Users can manage own portfolio" ON portfolio_entries;
CREATE POLICY "Users can manage own portfolio"
  ON portfolio_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix any missing policies for user_alerts
DROP POLICY IF EXISTS "Users can manage own alerts" ON user_alerts;
CREATE POLICY "Users can manage own alerts"
  ON user_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);