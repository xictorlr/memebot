export interface Memecoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  image: string;
  last_updated: string;
  ath: number;
  ath_change_percentage: number;
}

export interface TradingRule {
  id: string;
  name: string;
  coin: string;
  type: 'buy' | 'sell';
  condition: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_oversold' | 'rsi_overbought';
  value: number;
  active: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'buy' | 'sell' | 'info';
  coin: string;
  message: string;
  price: number;
  timestamp: string;
  read: boolean;
}

export interface TradingSignal {
  id: string;
  coin: string;
  type: 'buy' | 'sell' | 'hold';
  price: number;
  confidence: number;
  reason: string;
  timestamp: string;
  status: 'active' | 'executed' | 'expired';
}