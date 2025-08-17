// Top memecoins que realmente existen en CoinGecko
const MEMECOIN_IDS = [
  // Top Tier Memecoins
  'dogecoin',
  'shiba-inu', 
  'pepe',
  'dogwifcoin',
  'bonk',
  'floki',
  'brett-based',
  'popcat',
  'mog-coin',
  'cat-in-a-dogs-world',
  'book-of-meme',
  'pepecoin-2',
  'wojak',
  'turbo',
  'ladys',
  'jeo-boden',
  'slerf',
  'myro',
  'samoyedcoin',
  'degen-base',
  'baby-doge-coin',
  'kishu-inu',
  'akita-inu',
  'hoge-finance',
  'dogelon-mars',
  'saitama-inu',
  
  // Solana Memecoins
  'jupiter-exchange-solana',
  'raydium',
  'wen-4',
  'jito-governance-token',
  'hivemapper',
  'helium',
  'render-token',
  'pyth-network',
  'solana',
  'serum',
  
  // Base Chain Memecoins
  'based-brett',
  'higher',
  'toshi',
  'normie',
  'keycat',
  'mochi-market',
  'basenji',
  'tybg',
  'doginme',
  'crash',
  
  // Ethereum Memecoins
  'shiba-predator',
  'baby-shiba-inu',
  'shiba-saga',
  'shiba-girlfriend',
  'shiba-cosmos',
  'kishu-inu',
  'hokkaidu-inu',
  'jindo-inu',
  'american-shiba',
  'alaskan-malamute-token',
  
  // Trending Memecoins
  'gigachad-2',
  'apu-apustaja',
  'landwolf-0x67',
  'mumu-the-bull-3',
  'ponke',
  'retardio',
  'hoppy',
  'andy-ethereum',
  'pepe-2-0',
  'pepefork',
  
  // AI & Tech Memecoins
  'goatseus-maximus',
  'ai-companions',
  'terminal-of-truths',
  'zerebro',
  'virtuals-protocol',
  'griffain',
  'fartcoin',
  'act-i-the-ai-prophecy',
  'ai16z',
  'eliza',
  
  // Animal Memecoins
  'cat-token',
  'doggo-inu',
  'corgi-ai',
  'seal-2',
  'shark-cat',
  'duck-dao',
  'penguin-finance',
  'bear-inu',
  'tiger-king-coin',
  'lion-token',
  
  // Food & Fun Memecoins
  'pizza-2',
  'burger-swap',
  'sushi',
  'pancakeswap-token',
  'ice-token',
  'milk-alliance',
  'banana-gun',
  'donut-2',
  'cookie-3',
  'cake-monster',
  
  // Gaming Memecoins
  'gala',
  'axie-infinity',
  'the-sandbox',
  'decentraland',
  'enjincoin',
  'smooth-love-potion',
  'gods-unchained',
  'illuvium',
  'star-atlas',
  'yield-guild-games',
  
  // DeFi Memecoins
  'uniswap',
  'compound-governance-token',
  'aave',
  'maker',
  'yearn-finance',
  'curve-dao-token',
  'balancer',
  'synthetix-network-token',
  '1inch',
  'kyber-network-crystal',
  
  // New & Trending
  'maga',
  'tremp',
  'fight-to-maga',
  'super-trump',
  'dark-maga',
  'maga-hat',
  'save-america',
  'freedom-coin',
  'patriot-pay',
  'liberty-coin'
];

export class TradingAPI {
  private static instance: TradingAPI;
  
  static getInstance(): TradingAPI {
    if (!TradingAPI.instance) {
      TradingAPI.instance = new TradingAPI();
    }
    return TradingAPI.instance;
  }

  async getMemecoins() {
    try {
      const targetUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${MEMECOIN_IDS.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d`;
      
      // Use Supabase Edge Function as proxy
      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coingecko-proxy?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch memecoin data');
      }
      
      const coinData = await response.json();
      
      // Ensure coinData is an array before filtering
      if (!Array.isArray(coinData)) {
        console.warn('CoinGecko API returned non-array data:', coinData);
        return this.getFallbackData();
      }
      
      // Process and validate the data
      const processedData = coinData
        .filter(coin => coin && coin.market_cap > 0)
        .map(coin => ({
          ...coin,
          // Ensure volume_24h is a valid number
          volume_24h: coin.total_volume || coin.volume_24h || 0,
          // Ensure all required fields exist
          current_price: coin.current_price || 0,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          market_cap: coin.market_cap || 0,
          image: coin.image || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23374151"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${coin.symbol?.charAt(0)?.toUpperCase() || 'C'}</text></svg>`
        }));
      
      console.log('✅ Processed coin data:', processedData.slice(0, 3).map(c => ({ 
        symbol: c.symbol, 
        volume: c.volume_24h,
        market_cap: c.market_cap 
      })));
      
      return processedData;
        
    } catch (error) {
      console.error('Error fetching memecoins:', error);
      console.log('Falling back to demo data with proper volume values');
      return this.getFallbackData();
    }
  }

  // Simulate trading signals based on price movements and volume
  generateTradingSignals(memecoins: any[]) {
    const signals = [];
    
    for (const coin of memecoins) {
      const priceChange = coin.price_change_percentage_24h || 0;
      const volume = coin.total_volume || coin.volume_24h || 0;
      const marketCap = coin.market_cap || 0;
      
      // Skip coins with no data
      if (marketCap === 0) continue;
      
      const volumeRatio = volume / marketCap;
      const athDistance = coin.ath_change_percentage || -100;
      
      // Buy signals - More sensitive thresholds
      if (priceChange > 5 && volumeRatio > 0.05) {
        signals.push({
          id: `${coin.id}-buy-${Date.now()}`,
          coin: coin.symbol.toUpperCase(),
          type: 'buy' as const,
          price: coin.current_price,
          confidence: Math.round(Math.min(95, 60 + Math.abs(priceChange) + (volumeRatio * 100))),
          reason: priceChange > 15 ? 'Strong upward momentum' : 'Positive movement with volume',
          timestamp: new Date().toISOString(),
          status: 'active' as const
        });
      }
      // More buy conditions
      else if (priceChange > 3 && athDistance > -30) {
        signals.push({
          id: `${coin.id}-buy-recovery-${Date.now()}`,
          coin: coin.symbol.toUpperCase(),
          type: 'buy' as const,
          price: coin.current_price,
          confidence: Math.round(Math.min(85, 55 + Math.abs(priceChange))),
          reason: 'Recovery from recent lows',
          timestamp: new Date().toISOString(),
          status: 'active' as const
        });
      }
      
      // Sell signals - More sensitive
      if (priceChange < -5 && volumeRatio > 0.03) {
        signals.push({
          id: `${coin.id}-sell-${Date.now()}`,
          coin: coin.symbol.toUpperCase(),
          type: 'sell' as const,
          price: coin.current_price,
          confidence: Math.round(Math.min(90, 55 + Math.abs(priceChange) + (volumeRatio * 50))),
          reason: priceChange < -15 ? 'Heavy decline with volume' : 'Decline without volume support',
          timestamp: new Date().toISOString(),
          status: 'active' as const
        });
      }
      
      // Hold signals for stable coins
      if (Math.abs(priceChange) < 3 && volumeRatio > 0.02) {
        signals.push({
          id: `${coin.id}-hold-${Date.now()}`,
          coin: coin.symbol.toUpperCase(),
          type: 'hold' as const,
          price: coin.current_price,
          confidence: Math.round(Math.min(80, 50 + (volumeRatio * 100))),
          reason: 'Consolidation phase - prepare for next move',
          timestamp: new Date().toISOString(),
          status: 'active' as const
        });
      }
    }
    
    console.log(`🎯 Generated ${signals.length} trading signals from ${memecoins.length} coins`);
    
    // Log each signal for debugging
    signals.forEach((signal, index) => {
      console.log(`   ${index + 1}. ${signal.coin} ${signal.type} $${signal.price.toFixed(6)} (${signal.confidence}%) - ${signal.reason}`);
    });
    
    return signals;
  }

  private getFallbackData() {
    return [
      {
        id: 'dogecoin',
        symbol: 'doge',
        name: 'Dogecoin',
        current_price: 0.08234,
        price_change_24h: 0.00456,
        price_change_percentage_24h: 5.87,
        market_cap: 11234567890,
        volume_24h: 1456789012,
        total_volume: 1456789012,
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
        ath: 0.731578,
        ath_change_percentage: -88.7
      },
      {
        id: 'shiba-inu',
        symbol: 'shib',
        name: 'Shiba Inu',
        current_price: 0.000008234,
        price_change_24h: -0.000000456,
        price_change_percentage_24h: -5.25,
        market_cap: 4567890123,
        volume_24h: 523456789,
        total_volume: 523456789,
        image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
        ath: 0.000088,
        ath_change_percentage: -90.6
      },
      {
        id: 'pepe',
        symbol: 'pepe',
        name: 'Pepe',
        current_price: 0.000001234,
        price_change_24h: 0.000000123,
        price_change_percentage_24h: 12.45,
        market_cap: 2345678901,
        volume_24h: 834567890,
        total_volume: 834567890,
        image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
        ath: 0.000004354,
        ath_change_percentage: -71.6
      },
      {
        id: 'dogwifcoin',
        symbol: 'wif',
        name: 'dogwifhat',
        current_price: 2.34,
        price_change_24h: 0.23,
        price_change_percentage_24h: 10.87,
        market_cap: 1234567890,
        volume_24h: 445678901,
        total_volume: 445678901,
        image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg',
        ath: 4.83,
        ath_change_percentage: -51.6
      },
      {
        id: 'bonk',
        symbol: 'bonk',
        name: 'Bonk',
        current_price: 0.00001234,
        price_change_24h: -0.00000123,
        price_change_percentage_24h: -8.76,
        market_cap: 987654321,
        volume_24h: 223456789,
        total_volume: 223456789,
        image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
        ath: 0.00003419,
        ath_change_percentage: -63.9
      },
      {
        id: 'floki',
        symbol: 'floki',
        name: 'FLOKI',
        current_price: 0.00012345,
        price_change_24h: 0.00001234,
        price_change_percentage_24h: 15.67,
        market_cap: 1876543210,
        volume_24h: 334567890,
        total_volume: 334567890,
        image: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png',
        ath: 0.00034123,
        ath_change_percentage: -63.8
      },
      {
        id: 'brett-based',
        symbol: 'brett',
        name: 'Brett (Based)',
        current_price: 0.087654,
        price_change_24h: 0.012345,
        price_change_percentage_24h: 16.42,
        market_cap: 876543210,
        volume_24h: 187654321,
        total_volume: 187654321,
        image: 'https://assets.coingecko.com/coins/images/30134/large/brett.png',
        ath: 0.198765,
        ath_change_percentage: -55.9
      },
      {
        id: 'popcat',
        symbol: 'popcat',
        name: 'Popcat (SOL)',
        current_price: 0.543210,
        price_change_24h: -0.054321,
        price_change_percentage_24h: -9.12,
        market_cap: 543210987,
        volume_24h: 154321098,
        total_volume: 154321098,
        image: 'https://assets.coingecko.com/coins/images/33080/large/popcat.png',
        ath: 1.234567,
        ath_change_percentage: -56.0
      },
      {
        id: 'mog-coin',
        symbol: 'mog',
        name: 'Mog Coin',
        current_price: 0.00000123,
        price_change_24h: 0.00000012,
        price_change_percentage_24h: 10.81,
        market_cap: 321098765,
        volume_24h: 98765432,
        total_volume: 98765432,
        image: 'https://assets.coingecko.com/coins/images/30825/large/mog.png',
        ath: 0.00000456,
        ath_change_percentage: -73.0
      },
      {
        id: 'book-of-meme',
        symbol: 'bome',
        name: 'BOOK OF MEME',
        current_price: 0.009876,
        price_change_24h: 0.001234,
        price_change_percentage_24h: 14.29,
        market_cap: 987654321,
        volume_24h: 298765432,
        total_volume: 298765432,
        image: 'https://assets.coingecko.com/coins/images/35718/large/bome.png',
        ath: 0.028765,
        ath_change_percentage: -65.7
      }
    ];
  }
}