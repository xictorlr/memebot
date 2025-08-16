import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { TradingSignal } from '../types';

interface TradingSignalsProps {
  signals: TradingSignal[];
}

export default function TradingSignals({ signals }: TradingSignalsProps) {
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'executed':
        return 'text-green-500 bg-green-500/10';
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const activeSignals = signals.filter(s => s.status === 'active');
  const recentSignals = signals.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Active Signals */}
      {activeSignals.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <span>🚨 Señales Activas</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeSignals.length}
              </span>
            </h2>
            <div className="space-y-3">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {signal.type === 'buy' ? (
                        <ArrowUpCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {signal.type.toUpperCase()} {signal.coin}
                        </p>
                        <p className="text-gray-400 text-sm">{signal.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatPrice(signal.price)}</p>
                      <p className="text-sm text-gray-400">
                        Confianza: {signal.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Signals */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Historial de Señales</h2>
          <div className="space-y-3">
            {recentSignals.length > 0 ? (
              recentSignals.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {signal.type === 'buy' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    
                    <div>
                      <p className="font-semibold text-white">
                        {signal.type.toUpperCase()} {signal.coin}
                      </p>
                      <p className="text-gray-400 text-sm">{signal.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatPrice(signal.price)}</p>
                      <p className="text-sm text-gray-400">
                        {Math.round(signal.confidence)}% confianza
                      </p>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(signal.status)}`}>
                      {getStatusIcon(signal.status)}
                      <span className="text-xs font-medium capitalize">
                        {signal.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No hay señales disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}