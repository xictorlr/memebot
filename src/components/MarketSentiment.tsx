import React from 'react';
import { TrendingUp, TrendingDown, Activity, Zap, Target, AlertTriangle } from 'lucide-react';
import type { Memecoin } from '../types';

interface MarketSentimentProps {
  memecoins: Memecoin[];
}

export default function MarketSentiment({ memecoins }: MarketSentimentProps) {
  const calculateSentiment = () => {
    if (memecoins.length === 0) {
      console.log('⚠️ No memecoins data for sentiment calculation');
      return { score: 50, label: 'Neutral', color: 'text-gray-400' };
    }
    
    const validCoins = memecoins.filter(coin => 
      coin.price_change_percentage_24h !== null && 
      coin.price_change_percentage_24h !== undefined &&
      !isNaN(coin.price_change_percentage_24h)
    );
    
    if (validCoins.length === 0) {
      console.log('⚠️ No valid price change data for sentiment');
      return { score: 50, label: 'Neutral', color: 'text-gray-400' };
    }
    
    const gainers = validCoins.filter(coin => coin.price_change_percentage_24h > 0).length;
    const losers = validCoins.filter(coin => coin.price_change_percentage_24h < 0).length;
    const strongGainers = validCoins.filter(coin => coin.price_change_percentage_24h > 5).length;
    const strongLosers = validCoins.filter(coin => coin.price_change_percentage_24h < -5).length;
    const veryStrongGainers = validCoins.filter(coin => coin.price_change_percentage_24h > 15).length;
    const veryStrongLosers = validCoins.filter(coin => coin.price_change_percentage_24h < -15).length;
    
    let score = 50; // Neutral base
    
    // Basic sentiment from gainers vs losers
    const gainersRatio = gainers / validCoins.length;
    score += (gainersRatio - 0.5) * 40; // -20 to +20 points
    
    // Strong movements impact
    score += strongGainers * 3;
    score -= strongLosers * 3;
    score += veryStrongGainers * 8;
    score -= veryStrongLosers * 8;
    
    score = Math.max(0, Math.min(100, score));
    
    console.log(`📊 Sentiment calculation: ${gainers}/${validCoins.length} gainers, score: ${score}`);
    
    if (score >= 75) return { score, label: 'Extremely Bullish', color: 'text-green-400' };
    if (score >= 60) return { score, label: 'Bullish', color: 'text-green-500' };
    if (score >= 40) return { score, label: 'Neutral', color: 'text-gray-400' };
    if (score >= 25) return { score, label: 'Bearish', color: 'text-red-500' };
    return { score, label: 'Extremely Bearish', color: 'text-red-400' };
  };

  const getTopMovers = () => {
    const validCoins = memecoins.filter(coin => 
      coin.price_change_percentage_24h !== null && 
      coin.price_change_percentage_24h !== undefined &&
      !isNaN(coin.price_change_percentage_24h)
    );
    
    if (validCoins.length === 0) return [];
    
    const sorted = [...validCoins].sort((a, b) => 
      Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)
    );
    return sorted.slice(0, 3);
  };

  const getVolumeLeaders = () => {
    const validCoins = memecoins.filter(coin => {
      const volume = coin.total_volume || coin.volume_24h || 0;
      return volume > 0;
    });
    
    if (validCoins.length === 0) return [];
    
    const sorted = [...validCoins].sort((a, b) => {
      const volumeA = a.total_volume || a.volume_24h || 0;
      const volumeB = b.total_volume || b.volume_24h || 0;
      return volumeB - volumeA;
    });
    return sorted.slice(0, 3);
  };

  const sentiment = calculateSentiment();
  const topMovers = getTopMovers();
  const volumeLeaders = getVolumeLeaders();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-purple-500" />
          <span>Análisis de Mercado</span>
        </h2>

        {/* Market Sentiment */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Sentimiento del Mercado</h3>
            <span className={`font-bold ${sentiment.color}`}>{sentiment.label}</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  sentiment.score >= 75 ? 'bg-green-400' :
                  sentiment.score >= 60 ? 'bg-green-500' :
                  sentiment.score >= 40 ? 'bg-gray-500' :
                  sentiment.score >= 25 ? 'bg-red-500' : 'bg-red-400'
                }`}
                style={{ width: `${sentiment.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Bearish</span>
              <span>Neutral</span>
              <span>Bullish</span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-2xl font-bold text-white">{Math.round(sentiment.score)}/100</span>
          </div>
        </div>

        {/* Top Movers */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Mayores Movimientos</span>
          </h3>
          <div className="space-y-2">
            {topMovers.map((coin, index) => (
              <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 font-mono text-sm w-4">#{index + 1}</span>
                  <a 
                    href={`https://www.coingecko.com/en/coins/${coin.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="h-6 w-6 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23374151"/><text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${coin.symbol.charAt(0).toUpperCase()}</text></svg>`;
                      }}
                    />
                    <span className="text-white font-medium hover:text-blue-400 transition-colors">{coin.symbol.toUpperCase()}</span>
                  </a>
                </div>
                <div className={`flex items-center space-x-1 ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-bold">{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Leaders */}
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span>Líderes en Volumen</span>
          </h3>
          <div className="space-y-2">
            {volumeLeaders.map((coin, index) => (
              <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 font-mono text-sm w-4">#{index + 1}</span>
                  <a 
                    href={`https://www.coingecko.com/en/coins/${coin.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="h-6 w-6 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23374151"/><text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${coin.symbol.charAt(0).toUpperCase()}</text></svg>`;
                      }}
                    />
                    <span className="text-white font-medium hover:text-blue-400 transition-colors">{coin.symbol.toUpperCase()}</span>
                  </a>
                </div>
                <div className="text-right">
                  <span className="text-white font-mono text-sm">
                    ${(((coin.total_volume || coin.volume_24h || 0)) / 1e6).toFixed(1)}M
                  </span>
                  <div className="text-xs text-gray-400">
                    {(((coin.total_volume || coin.volume_24h || 0) / (coin.market_cap || 1)) * 100).toFixed(1)}% MCap
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Alerts */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-400 font-medium">Alerta de Mercado</span>
          </div>
          <p className="text-yellow-300 text-sm">
            {sentiment.score >= 75 ? 
              '🚀 Mercado extremadamente alcista. Considera tomar ganancias parciales.' :
            sentiment.score >= 60 ?
              '📈 Tendencia alcista confirmada. Buen momento para posiciones largas.' :
            sentiment.score >= 40 ?
              '⚖️ Mercado lateral. Espera confirmación de dirección.' :
            sentiment.score >= 25 ?
              '📉 Tendencia bajista. Considera reducir exposición.' :
              '🔴 Mercado extremadamente bajista. Mantén efectivo y espera oportunidades.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}