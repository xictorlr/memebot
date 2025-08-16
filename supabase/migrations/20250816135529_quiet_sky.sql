/*
  # Complete Database Schema for MemeBot v1.0

  1. New Tables
    - `user_profiles` - User configuration and Telegram settings
    - `watchlists` - Personal coin watchlists
    - `trading_rules` - Custom trading rules and alerts
    - `portfolio_entries` - Portfolio tracking with P&L
    - `user_alerts` - User notifications and alerts

  2. Security
    - Enable RLS on all tables
    - User-specific policies for data isolation
    - Automatic profile creation on user signup

  3. Features
    - Auto-update timestamps
    - Telegram bot integration
    - Portfolio profit/loss calculations
    - Custom trading alerts
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username text,
  telegram_chat_id text,
  telegram_bot_token text,
  alerts_enabled boolean DEFAULT true,
  alert_frequency integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Mi Watchlist',
  coins text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trading rules table
CREATE TABLE IF NOT EXISTS trading_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('price_above', 'price_below', 'volume_spike', 'rsi_oversold', 'rsi_overbought')),
  value numeric NOT NULL,
  action text NOT NULL CHECK (action IN ('buy', 'sell', 'notify')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portfolio entries table
CREATE TABLE IF NOT EXISTS portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id text NOT NULL,
  symbol text NOT NULL,
  amount numeric NOT NULL,
  buy_price numeric NOT NULL,
  current_price numeric DEFAULT 0,
  profit_loss numeric DEFAULT 0,
  profit_loss_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('price', 'volume', 'signal', 'news')),
  message text NOT NULL,
  price numeric,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for watchlists
CREATE POLICY "Users can manage own watchlists"
  ON watchlists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for trading_rules
CREATE POLICY "Users can manage own trading rules"
  ON trading_rules FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for portfolio_entries
CREATE POLICY "Users can manage own portfolio"
  ON portfolio_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_alerts
CREATE POLICY "Users can manage own alerts"
  ON user_alerts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_watchlists_updated_at
  BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trading_rules_updated_at
  BEFORE UPDATE ON trading_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_entries_updated_at
  BEFORE UPDATE ON portfolio_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, telegram_chat_id, telegram_bot_token)
  VALUES (NEW.id, NEW.email, '5441177022', '8486768601:AAF9_1rbGsJ-r7Zq-y4lnt08QeAxAOBVFG0')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();