import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import type { Memecoin } from '../types';

interface MemecoinListProps {
  memecoins: Memecoin[];
  loading: boolean;
}

export default function MemecoinList({ memecoins, loading }: MemecoinListProps) {
  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    if (value === 0) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(6)}`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Memecoins</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Top Memecoins</h2>
        <div className="space-y-3">
          {memecoins.map((coin, index) => (
            <div key={coin.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 font-mono text-sm w-6 text-center">
                  {index + 1}
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
                <div className={`flex items-center space-x-1 text-sm ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="hidden sm:block text-right">
                <p className="text-gray-400 text-sm">MCap</p>
                <p className="text-white font-mono text-sm">
                  {formatCurrency(coin.market_cap || 0)}
                </p>
              </div>
              
              <div className="hidden md:block text-right">
                <p className="text-gray-400 text-sm">Vol 24h</p>
                <p className="text-white font-mono text-sm">
                  {formatCurrency(coin.volume_24h)}
                </p>
              </div>
              
              <button className="text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}