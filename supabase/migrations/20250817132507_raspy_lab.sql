/*
  # Trading History and Performance Tracking

  1. New Tables
    - `trading_actions`
      - `id` (uuid, primary key)
      - `coin_id` (text)
      - `symbol` (text)
      - `action` (text: buy/sell/hold)
      - `price` (numeric)
      - `confidence` (integer)
      - `reason` (text)
      - `market_cap` (numeric)
      - `volume_24h` (numeric)
      - `price_change_24h` (numeric)
      - `created_at` (timestamp)
    
    - `trading_performance`
      - `id` (uuid, primary key)
      - `coin_id` (text)
      - `symbol` (text)
      - `buy_price` (numeric)
      - `sell_price` (numeric)
      - `buy_date` (timestamp)
      - `sell_date` (timestamp)
      - `profit_loss` (numeric)
      - `profit_loss_percentage` (numeric)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for analytics
*/

-- Trading Actions Table
CREATE TABLE IF NOT EXISTS trading_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id text NOT NULL,
  symbol text NOT NULL,
  action text NOT NULL CHECK (action IN ('buy', 'sell', 'hold')),
  price numeric NOT NULL,
  confidence integer NOT NULL,
  reason text NOT NULL,
  market_cap numeric DEFAULT 0,
  volume_24h numeric DEFAULT 0,
  price_change_24h numeric DEFAULT 0,
  rsi numeric,
  volume_spike boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Trading Performance Table
CREATE TABLE IF NOT EXISTS trading_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id text NOT NULL,
  symbol text NOT NULL,
  buy_price numeric NOT NULL,
  sell_price numeric,
  buy_date timestamptz NOT NULL,
  sell_date timestamptz,
  profit_loss numeric DEFAULT 0,
  profit_loss_percentage numeric DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trading_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_performance ENABLE ROW LEVEL SECURITY;

-- Public read policies for analytics
CREATE POLICY "Public can read trading actions"
  ON trading_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read trading performance"
  ON trading_performance
  FOR SELECT
  TO public
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_actions_symbol_created ON trading_actions(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_actions_action_created ON trading_actions(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_performance_symbol ON trading_performance(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_performance_status ON trading_performance(status, created_at DESC);