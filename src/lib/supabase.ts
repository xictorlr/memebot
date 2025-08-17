import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          telegram_chat_id: string | null
          telegram_bot_token: string | null
          alerts_enabled: boolean
          alert_frequency: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          telegram_chat_id?: string | null
          telegram_bot_token?: string | null
          alerts_enabled?: boolean
          alert_frequency?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          telegram_chat_id?: string | null
          telegram_bot_token?: string | null
          alerts_enabled?: boolean
          alert_frequency?: number
          created_at?: string
          updated_at?: string
        }
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          name: string
          coins: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          coins: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          coins?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      trading_rules: {
        Row: {
          id: string
          user_id: string
          coin_id: string
          rule_type: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_oversold' | 'rsi_overbought'
          value: number
          action: 'buy' | 'sell' | 'notify'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_id: string
          rule_type: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_oversold' | 'rsi_overbought'
          value: number
          action: 'buy' | 'sell' | 'notify'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_id?: string
          rule_type?: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_oversold' | 'rsi_overbought'
          value?: number
          action?: 'buy' | 'sell' | 'notify'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_entries: {
        Row: {
          id: string
          user_id: string | null
          user_id: string
          coin_id: string
          symbol: string
          amount: number
          buy_price: number
          current_price: number
          profit_loss: number
          profit_loss_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_id: string
          symbol: string
          amount: number
          buy_price: number
          current_price?: number
          profit_loss?: number
          profit_loss_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_id?: string
          symbol?: string
          amount?: number
          buy_price?: number
          current_price?: number
          profit_loss?: number
          profit_loss_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          coin_id: string
          alert_type: 'price' | 'volume' | 'signal' | 'news'
          message: string
          price: number | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_id: string
          coin_id: string
          alert_type: 'price' | 'volume' | 'signal' | 'news'
          message: string
          price?: number | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_id?: string
          coin_id?: string
          alert_type?: 'price' | 'volume' | 'signal' | 'news'
          message?: string
          price?: number | null
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}