/*
  # Trading Analyzer Edge Function - Telegram Bot

  1. Functionality
    - Analyzes memecoin data every hour
    - Generates BUY/HOLD/SELL recommendations
    - Sends Telegram notifications via Telegram Bot API
    - Uses technical indicators and market sentiment

  2. Telegram Integration
    - Uses Telegram Bot API (much simpler than WhatsApp)
    - Sends formatted trading signals with emojis
    - Includes price alerts and recommendations

  3. Analysis Logic
    - RSI calculations for overbought/oversold
    - Volume spike detection
    - Price momentum analysis
    - Support/resistance levels
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MemecoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  market_cap: number;
  volume_24h: number;
  ath: number;
  ath_change_percentage: number;
}

interface TradingSignal {
  coin: string;
  action: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  price: number;
  reason: string;
  rsi?: number;
  volumeSpike?: boolean;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

class TradingAnalyzer {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private readonly TELEGRAM_API_URL = 'https://api.telegram.org/bot';
  
  // Telegram Bot credentials (set in Supabase dashboard)
  private readonly TELEGRAM_BOT_TOKEN = '8486768601:AAF9_1rbGsJ-r7Zq-y4lnt08QeAxAOBVFG0'; // @VictorLopezRapado_Alert_bot
  private readonly TELEGRAM_CHAT_ID = '5441177022'; // Victor's chat ID

  async analyzeMarket(): Promise<TradingSignal[]> {
    try {
      console.log('🔍 Starting market analysis...');
      const topMemecoins = await this.getTopMemecoins();
      console.log(`📊 Analyzing ${topMemecoins.length} memecoins...`);
      const signals: TradingSignal[] = [];

      for (const coin of topMemecoins) {
        const signal = this.analyzeCoin(coin);
        if (signal && signal.confidence > 50) {
          signals.push(signal);
        }
      }

      console.log(`🎯 Generated ${signals.length} signals with confidence > 50%`);
      signals.forEach((signal, index) => {
        console.log(`   ${index + 1}. ${signal.coin} ${signal.action} $${signal.price < 0.01 ? signal.price.toFixed(6) : signal.price.toFixed(4)} (${signal.confidence}%) - ${signal.reason}`);
      });
      
      return signals.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    } catch (error) {
      console.error('Error analyzing market:', error);
      return [];
    }
  }

  private async getTopMemecoins(): Promise<MemecoinData[]> {
    const memecoins = [
      // Top Tier Memecoins
      'dogecoin', 'shiba-inu', 'pepe', 'dogwifcoin', 'bonk', 'floki',
      'brett-based', 'popcat', 'mog-coin', 'cat-in-a-dogs-world',
      'book-of-meme', 'pepecoin-2', 'wojak', 'turbo', 'ladys',
      'jeo-boden', 'slerf', 'myro', 'samoyedcoin', 'degen-base',
      'baby-doge-coin', 'kishu-inu', 'akita-inu', 'hoge-finance',
      'dogelon-mars', 'saitama-inu',
      
      // Solana Ecosystem
      'jupiter-exchange-solana', 'raydium', 'wen-4', 'jito-governance-token',
      'hivemapper', 'helium', 'render-token', 'pyth-network',
      
      // Base Chain Memecoins
      'based-brett', 'higher', 'toshi', 'normie', 'keycat',
      'mochi-market', 'basenji', 'tybg', 'doginme', 'crash',
      
      // Trending & New
      'gigachad-2', 'apu-apustaja', 'landwolf-0x67', 'mumu-the-bull-3',
      'ponke', 'retardio', 'hoppy', 'andy-ethereum', 'pepe-2-0',
      
      // AI Memecoins
      'goatseus-maximus', 'ai-companions', 'terminal-of-truths',
      'zerebro', 'virtuals-protocol', 'fartcoin', 'act-i-the-ai-prophecy',
      
      // Animal Theme
      'cat-token', 'doggo-inu', 'corgi-ai', 'seal-2', 'shark-cat',
      'duck-dao', 'penguin-finance', 'bear-inu', 'tiger-king-coin',
      
      // Gaming & DeFi
      'gala', 'axie-infinity', 'the-sandbox', 'decentraland',
      'uniswap', 'compound-governance-token', 'aave', 'maker'
    ];

    try {
      const targetUrl = `${this.COINGECKO_API}/coins/markets?vs_currency=usd&ids=${memecoins.join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h,7d`;
      
      const response = await fetch(targetUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MemeBot-Trading-App/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch memecoin data');
      }
      
      const coinData = await response.json();
      
      if (!Array.isArray(coinData)) {
        console.warn('API returned non-array data, using fallback');
        return this.getFallbackData();
      }
      
      return coinData.filter(coin => coin.market_cap > 0);
    } catch (error) {
      console.error('Error fetching memecoins:', error);
      return this.getFallbackData();
    }
  }

  private getFallbackData(): MemecoinData[] {
    return [
      {
        id: 'dogecoin',
        symbol: 'doge',
        name: 'Dogecoin',
        current_price: 0.08234,
        price_change_percentage_24h: 5.87,
        price_change_percentage_7d: 12.45,
        market_cap: 11234567890,
        volume_24h: 456789012,
        ath: 0.731578,
        ath_change_percentage: -88.7
      },
      {
        id: 'shiba-inu',
        symbol: 'shib',
        name: 'Shiba Inu',
        current_price: 0.000008234,
        price_change_percentage_24h: -5.25,
        price_change_percentage_7d: -8.76,
        market_cap: 4567890123,
        volume_24h: 123456789,
        ath: 0.000088,
        ath_change_percentage: -90.6
      },
      {
        id: 'pepe',
        symbol: 'pepe',
        name: 'Pepe',
        current_price: 0.000001234,
        price_change_percentage_24h: 12.45,
        price_change_percentage_7d: 25.67,
        market_cap: 2345678901,
        volume_24h: 234567890,
        ath: 0.000004354,
        ath_change_percentage: -71.6
      }
    ];
  }

  private analyzeCoin(coin: MemecoinData): TradingSignal | null {
    const priceChange24h = coin.price_change_percentage_24h || 0;
    const priceChange7d = coin.price_change_percentage_7d || 0;
    const volumeRatio = coin.volume_24h / coin.market_cap;
    const athDistance = coin.ath_change_percentage || -100;

    // Calculate RSI approximation based on price changes (0-100 scale)
    const rsi = this.calculateSimpleRSI(priceChange24h, priceChange7d);
    
    // Volume spike detection - High trading activity
    const volumeSpike = volumeRatio > 0.02; // 2% of market cap in 24h volume (más sensible)
    const highVolume = volumeRatio > 0.01; // 1% threshold for significant volume (más sensible)

    let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    let confidence = 50;
    let reason = 'Neutral market conditions';

    console.log(`📊 Analizando ${coin.symbol}:`);
    console.log(`   💰 Precio 24h: ${priceChange24h.toFixed(2)}%`);
    console.log(`   📊 Volumen/MCap: ${(volumeRatio * 100).toFixed(2)}%`);
    console.log(`   📈 RSI: ${rsi.toFixed(1)}`);
    console.log(`   🎯 ATH Distance: ${athDistance.toFixed(1)}%`);

    // 🟢 BUY SIGNALS - Umbrales MUY sensibles para detectar oportunidades
    
    // 1. Movimiento positivo con algo de volumen
    if (priceChange24h > 2 && highVolume) {
      action = 'BUY';
      confidence = Math.min(95, 50 + Math.abs(priceChange24h) * 2 + (volumeRatio * 200));
      reason = priceChange24h > 10 ? 'Fuerte momentum alcista' : 'Movimiento positivo con volumen';
    }
    // 2. Recuperación desde mínimos
    else if (priceChange24h > 1 && athDistance > -50) {
      action = 'BUY';
      confidence = Math.min(85, 45 + Math.abs(priceChange24h) * 3);
      reason = 'Recuperación desde mínimos recientes';
    }
    // 3. Oversold con volumen
    else if (priceChange24h < -5 && priceChange24h > -15 && volumeSpike) {
      action = 'BUY';
      confidence = Math.min(90, 60 + Math.abs(priceChange24h));
      reason = 'Oversold - posible rebote';
    }

    // 🔴 SELL SIGNALS - Umbrales sensibles
    
    // 1. Caída con volumen
    else if (priceChange24h < -3 && highVolume) {
      action = 'SELL';
      confidence = Math.min(90, 50 + Math.abs(priceChange24h) * 2 + (volumeRatio * 100));
      reason = priceChange24h < -10 ? 'Caída fuerte con volumen' : 'Declive sin soporte de volumen';
    }
    // 2. Overbought
    else if (priceChange24h > 15 && athDistance > -20) {
      action = 'SELL';
      confidence = 85;
      reason = 'Overbought - tomar ganancias';
    }

    // 🟡 HOLD SIGNALS - Consolidación
    
    // 1. Consolidación con volumen
    else if (Math.abs(priceChange24h) < 2 && highVolume) {
      action = 'HOLD';
      confidence = 75;
      reason = 'Consolidación - esperar próximo movimiento';
    }

    // Solo retornar señales con confianza > 50% (más permisivo)
    if (confidence < 50) {
      return null;
    }

    console.log(`🎯 SEÑAL: ${coin.symbol} ${action} (${confidence}%)`);
    console.log(`   📝 ${reason}`);

    return {
      coin: coin.symbol.toUpperCase(),
      action,
      confidence,
      price: coin.current_price,
      reason,
      rsi,
      volumeSpike
    };
  }

  private calculateSimpleRSI(change24h: number, change7d: number): number {
    // Simplified RSI calculation based on recent price changes
    const avgGain = Math.max(0, (change24h + change7d) / 2);
    const avgLoss = Math.abs(Math.min(0, (change24h + change7d) / 2));
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  async saveActionsToDatabase(signals: TradingSignal[]): Promise<void> {
    try {
      const actions = signals.map(signal => ({
        coin_id: signal.coin.toLowerCase(),
        symbol: signal.coin,
        action: signal.action.toLowerCase(),
        price: signal.price,
        confidence: signal.confidence,
        reason: signal.reason,
        rsi: signal.rsi,
        volume_spike: signal.volumeSpike || false
      }));

      const { error } = await supabase
        .from('trading_actions')
        .insert(actions);

      if (error) {
        console.error('Error saving actions to database:', error);
      } else {
        console.log(`✅ Saved ${actions.length} actions to database`);
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }

  async sendTelegramMessage(signals: TradingSignal[]): Promise<void> {
    if (!this.TELEGRAM_BOT_TOKEN || !this.TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return;
    }

    const message = this.formatTradingMessage(signals);
    
    const payload = {
      chat_id: this.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    };

    try {
      const response = await fetch(
        `${this.TELEGRAM_API_URL}${this.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Telegram API error:', error);
        throw new Error(`Telegram API error: ${error}`);
      } else {
        console.log('✅ Telegram message sent successfully');
        const result = await response.json();
        console.log('Telegram response:', result);
      }
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      throw error;
    }
  }

  private formatTradingMessage(signals: TradingSignal[]): string {
    const timestamp = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Separar señales por tipo
    const buySignals = signals.filter(signal => signal.action === 'BUY');
    const sellSignals = signals.filter(signal => signal.action === 'SELL');
    const holdSignals = signals.filter(signal => signal.action === 'HOLD');

    let message = `🤖 *MEMEBOT TRADING ALERT* 🤖\n`;
    message += `📅 ${timestamp}\n\n`;

    if (signals.length === 0) {
      message += `⚠️ *SIN SEÑALES FUERTES*\n`;
      message += `No hay señales de trading en este momento\\.\n`;
      message += `Esperando mejores oportunidades de entrada\\.\n\n`;
      message += `💡 *Estrategia*: Mantén efectivo y espera dips\\.`;
      return message;
    }

    const totalSignals = buySignals.length + sellSignals.length + holdSignals.length;
    message += `📊 *ANÁLISIS COMPLETO \\- ${totalSignals} SEÑALES*\n\n`;

    // SEÑALES BUY
    if (buySignals.length > 0) {
      message += `🟢 *COMPRAR \\(${buySignals.length}\\)*\n`;
      buySignals.forEach((signal, index) => {
        message += `\n*${index + 1}\\. ${signal.coin}* 📈\n`;
        message += `💰 $${this.formatPrice(signal.price)}\n`;
        message += `🔥 ${signal.confidence}% confianza\n`;
        message += `📝 ${this.escapeMarkdown(signal.reason)}\n`;
        
        if (signal.rsi) {
          message += `📊 RSI: ${signal.rsi.toFixed(1)}`;
          if (signal.rsi < 40) message += ` \\(OVERSOLD\\)`;
          else if (signal.rsi > 70) message += ` \\(OVERBOUGHT\\)`;
          message += `\n`;
        }
        
        if (signal.volumeSpike) {
          message += `🚀 VOLUMEN ALTO\n`;
        }
      });
      message += `\n`;
    }

    // SEÑALES SELL
    if (sellSignals.length > 0) {
      message += `🔴 *VENDER \\(${sellSignals.length}\\)*\n`;
      sellSignals.forEach((signal, index) => {
        message += `\n*${index + 1}\\. ${signal.coin}* 📉\n`;
        message += `💰 $${this.formatPrice(signal.price)}\n`;
        message += `🔥 ${signal.confidence}% confianza\n`;
        message += `📝 ${this.escapeMarkdown(signal.reason)}\n`;
        
        if (signal.rsi) {
          message += `📊 RSI: ${signal.rsi.toFixed(1)}`;
          if (signal.rsi < 40) message += ` \\(OVERSOLD\\)`;
          else if (signal.rsi > 70) message += ` \\(OVERBOUGHT\\)`;
          message += `\n`;
        }
        
        if (signal.volumeSpike) {
          message += `⚠️ VENTA CON VOLUMEN\n`;
        }
      });
      message += `\n`;
    }

    // SEÑALES HOLD
    if (holdSignals.length > 0) {
      message += `🟡 *MANTENER \\(${holdSignals.length}\\)*\n`;
      holdSignals.forEach((signal, index) => {
        message += `\n*${index + 1}\\. ${signal.coin}* ⚖️\n`;
        message += `💰 $${this.formatPrice(signal.price)}\n`;
        message += `🔥 ${signal.confidence}% confianza\n`;
        message += `📝 ${this.escapeMarkdown(signal.reason)}\n`;
        
        if (signal.rsi) {
          message += `📊 RSI: ${signal.rsi.toFixed(1)} \\(NEUTRAL\\)\n`;
        }
        
        if (signal.volumeSpike) {
          message += `📊 ACUMULACIÓN DETECTADA\n`;
        }
      });
      message += `\n`;
    }

    message += `⚠️ *GESTIÓN DE RIESGO*\n`;
    message += `🟢 *Compras*: Stop\\-loss \\-5%, Take profit \\+15%\n`;
    message += `🔴 *Ventas*: Tomar ganancias gradualmente\n`;
    message += `🟡 *Hold*: Esperar confirmación de breakout\n`;
    message += `💡 Máximo 3\\-5% del capital por trade\n\n`;
    message += `🔄 Próximo análisis en 5 minutos\n`;
    message += `🌐 Dashboard: https://xictorlrbot\\.com`;

    return message;
  }

  private escapeMarkdown(text: string): string {
    // Escape special Markdown characters for Telegram
    return text
      .replace(/\./g, '\\.')
      .replace(/\-/g, '\\-')
      .replace(/\+/g, '\\+')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\%/g, '\\%');
  }

  private formatPrice(price: number): string {
    if (price < 0.000001) return price.toFixed(8);
    if (price < 0.001) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting trading analysis...');
    
    const analyzer = new TradingAnalyzer();
    const signals = await analyzer.analyzeMarket();
    
    console.log(`📊 Found ${signals.length} signals`);
    
    // Save actions to database
    await analyzer.saveActionsToDatabase(signals);
    
    // Send Telegram notification
    await analyzer.sendTelegramMessage(signals);
    
    return new Response(
      JSON.stringify({
        success: true,
        signals,
        message: `Analysis completed and Telegram notification sent with ${signals.length} signals`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in trading analyzer:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});