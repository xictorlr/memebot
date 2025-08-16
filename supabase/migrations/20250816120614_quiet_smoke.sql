/*
  # Create User System for MemeBot

  1. New Tables
    - `user_profiles` - Extended user profiles with Telegram config
    - `watchlists` - User custom coin watchlists
    - `trading_rules` - User-defined trading rules and alerts
    - `portfolio_entries` - User portfolio tracking
    - `user_alerts` - Personalized alerts history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Secure access patterns for user data

  3. Features
    - Telegram bot integration per user
    - Custom watchlists and portfolios
    - Automated trading rules
    - Personal alert system
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  telegram_chat_id text,
  telegram_bot_token text,
  alerts_enabled boolean DEFAULT true,
  alert_frequency integer DEFAULT 5, -- minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
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
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for watchlists
CREATE POLICY "Users can manage own watchlists"
  ON watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for trading_rules
CREATE POLICY "Users can manage own trading rules"
  ON trading_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for portfolio_entries
CREATE POLICY "Users can manage own portfolio"
  ON portfolio_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_alerts
CREATE POLICY "Users can manage own alerts"
  ON user_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, username)
  VALUES (NEW.id, NEW.email);
  
  -- Create default watchlist
  INSERT INTO watchlists (user_id, name, coins)
  VALUES (NEW.id, 'Favoritos', ARRAY['dogecoin', 'shiba-inu', 'pepe', 'bonk', 'dogwifcoin']);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create function to update timestamps
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
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_watchlists_updated_at
  BEFORE UPDATE ON watchlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trading_rules_updated_at
  BEFORE UPDATE ON trading_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_entries_updated_at
  BEFORE UPDATE ON portfolio_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();