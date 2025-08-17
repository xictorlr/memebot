import React from 'react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import type { Memecoin, TradingSignal } from '../types';

interface StatsCardsProps {
  memecoins: Memecoin[];
  signals: TradingSignal[];
}

export default function StatsCards({ memecoins, signals }: StatsCardsProps) {
  const [showGainersModal, setShowGainersModal] = useState(false);
  
  const totalMarketCap = memecoins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const totalVolume = memecoins.reduce((sum, coin) => sum + (coin.volume_24h || 0), 0);
  const gainers = memecoins.filter(coin => coin.price_change_percentage_24h > 0);
  const gainersCount = gainers.length;
  const activeSignals = signals.filter(signal => signal.status === 'active').length;

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    if (value === 0) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  // Sort gainers by percentage change
  const sortedGainers = gainers.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Market Cap Total</p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(totalMarketCap)}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Volumen 24h</p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(totalVolume)}
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>

      <div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setShowGainersModal(true)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Coins en Alza</p>
            <p className="text-2xl font-bold text-green-500 mt-2">
              {gainersCount}/{memecoins.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Click para ver detalles</p>
          </div>
          <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Señales Activas</p>
            <p className="text-2xl font-bold text-yellow-500 mt-2">
              {activeSignals}
            </p>
          </div>
          <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>
      </div>

      {/* Gainers Modal */}
      {showGainersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Coins en Alza ({gainersCount})</span>
                </h2>
                <button
                  onClick={() => setShowGainersModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {sortedGainers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 font-mono text-sm w-8 text-center">
                        #{index + 1}
                      </span>
                      
                      <img 
                        src={coin.image} 
                        alt={coin.name}
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23374151"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${coin.symbol.charAt(0).toUpperCase()}</text></svg>`;
                        }}
                      />
                      
                      <div>
                        <h3 className="font-semibold text-white">{coin.name}</h3>
                        <p className="text-gray-400 text-sm uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatPrice(coin.current_price)}
                      </p>
                      <div className="flex items-center space-x-1 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">+{coin.price_change_percentage_24h.toFixed(2)}%</span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block text-right">
                  <a 
                    href={`https://www.coingecko.com/en/coins/${coin.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="h-10 w-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23374151"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${coin.symbol.charAt(0).toUpperCase()}</text></svg>`;
                      }}
                    />
                  </a>
                      <p className="text-white font-mono text-sm">
                        {formatCurrency(coin.volume_24h || 0)}
                    <a 
                      href={`https://www.coingecko.com/en/coins/${coin.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                    >
                      <h3 className="font-semibold text-white">{coin.name}</h3>
                    </a>
                    <p className="text-gray-400 text-sm uppercase">{coin.symbol}</p>
                  </div>
                ))}
              </div>
              
              {sortedGainers.length === 0 && (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay coins en alza en este momento</p>
                  <p className="text-gray-500 text-sm">El mercado está en corrección</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}