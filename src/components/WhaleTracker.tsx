import React from 'react';
import { Fish, TrendingUp, TrendingDown, Eye, DollarSign } from 'lucide-react';
import type { Memecoin } from '../types';

interface WhaleMove {
  id: string;
  wallet: string;
  coin: string;
  type: 'buy' | 'sell';
  amount: number;
  value: number;
  timestamp: string;
  exchange?: string;
}

interface WhaleTrackerProps {
  memecoins: Memecoin[];
}

export default function WhaleTracker({ memecoins }: WhaleTrackerProps) {
  // Simulated whale movements based on volume spikes
  const generateWhaleMovements = (): WhaleMove[] => {
    const movements: WhaleMove[] = [];
    
    // Generate movements for coins with high volume
    const highVolumeCoins = memecoins
      .filter(coin => coin.volume_24h > coin.market_cap * 0.1)
      .slice(0, 5);
    
    highVolumeCoins.forEach((coin, index) => {
      const isBuy = coin.price_change_percentage_24h > 0;
      const baseAmount = coin.volume_24h * (0.05 + Math.random() * 0.1); // 5-15% of volume
      
      movements.push({
        id: `whale-${coin.id}-${index}`,
        wallet: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        coin: coin.symbol.toUpperCase(),
        type: isBuy ? 'buy' : 'sell',
        amount: baseAmount / coin.current_price,
        value: baseAmount,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Last hour
        exchange: ['Binance', 'Coinbase', 'Uniswap', 'PancakeSwap'][Math.floor(Math.random() * 4)]
      });
    });
    
    return movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const whaleMovements = generateWhaleMovements();
  
  const formatValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Fish className="h-5 w-5 text-cyan-500" />
            <span>Whale Tracker</span>
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full">
              LIVE
            </span>
          </h2>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <Eye className="h-4 w-4" />
            <span className="text-sm">Movimientos grandes detectados</span>
          </div>
        </div>

        {/* Whale Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-400 text-sm">Compras Grandes</span>
            </div>
            <p className="text-xl font-bold text-green-500">
              {whaleMovements.filter(m => m.type === 'buy').length}
            </p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-gray-400 text-sm">Ventas Grandes</span>
            </div>
            <p className="text-xl font-bold text-red-500">
              {whaleMovements.filter(m => m.type === 'sell').length}
            </p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-gray-400 text-sm">Volumen Total</span>
            </div>
            <p className="text-xl font-bold text-blue-500">
              {formatValue(whaleMovements.reduce((sum, m) => sum + m.value, 0))}
            </p>
          </div>
        </div>

        {/* Whale Movements */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white mb-3">Movimientos Recientes</h3>
          
          {whaleMovements.length === 0 ? (
            <div className="text-center py-8 bg-gray-700/20 rounded-lg">
              <Fish className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No se detectaron movimientos grandes recientes</p>
              <p className="text-gray-500 text-sm">Los whales están en aguas tranquilas</p>
            </div>
          ) : (
            whaleMovements.map((movement) => (
              <div key={movement.id} className={`p-4 rounded-lg border-l-4 ${
                movement.type === 'buy' ? 'border-l-green-500 bg-green-500/5' : 'border-l-red-500 bg-red-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {movement.type === 'buy' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">
                          {movement.type === 'buy' ? '🐋 COMPRA' : '🐋 VENTA'} {movement.coin}
                        </h3>
                        {movement.exchange && (
                          <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                            {movement.exchange}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm">
                        Wallet: <span className="font-mono">{movement.wallet}</span>
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-white font-mono text-sm">
                          {formatAmount(movement.amount)} {movement.coin}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className={`font-bold ${
                          movement.type === 'buy' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatValue(movement.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{getTimeAgo(movement.timestamp)}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        movement.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {movement.value >= 1e6 ? 'MEGA WHALE' : movement.value >= 1e5 ? 'WHALE' : 'DOLPHIN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert */}
        <div className="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Fish className="h-4 w-4 text-cyan-500" />
            <span className="text-cyan-400 font-medium">Whale Alert</span>
          </div>
          <p className="text-cyan-300 text-sm">
            Los movimientos de whales pueden indicar cambios importantes en el precio. 
            Grandes compras suelen preceder pumps, mientras que grandes ventas pueden indicar dumps.
          </p>
        </div>
      </div>
    </div>
  );
}