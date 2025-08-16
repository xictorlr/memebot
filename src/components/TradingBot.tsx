import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, DollarSign, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TradingBotProps {
  signals: Array<{
    coin: string;
    type: 'buy' | 'sell';
    confidence: number;
    price: number;
    reason: string;
  }>;
}

export default function TradingBot({ signals }: TradingBotProps) {
  const { user } = useAuth();
  const [botActive, setBotActive] = useState(false);
  const [botConfig, setBotConfig] = useState({
    maxInvestment: 100,
    minConfidence: 75,
    stopLoss: 10,
    takeProfit: 20,
    autoTrade: false
  });
  const [showConfig, setShowConfig] = useState(false);

  // Simulated bot stats
  const [botStats] = useState({
    totalTrades: 47,
    winRate: 68.1,
    totalProfit: 234.56,
    todayTrades: 3,
    activePositions: 2
  });

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Inicia sesión para activar el trading bot</p>
        </div>
      </div>
    );
  }

  const handleConfigSave = () => {
    setShowConfig(false);
    // Here you would save the config to the backend
  };

  const activeSignals = signals.filter(s => s.confidence >= botConfig.minConfidence);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>Trading Bot</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              botActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {botActive ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setBotActive(!botActive)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                botActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {botActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{botActive ? 'Pausar' : 'Activar'}</span>
            </button>
          </div>
        </div>

        {/* Bot Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Trades Total</p>
            <p className="text-white font-bold">{botStats.totalTrades}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Win Rate</p>
            <p className="text-green-500 font-bold">{botStats.winRate}%</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Profit Total</p>
            <p className="text-green-500 font-bold">${botStats.totalProfit}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Hoy</p>
            <p className="text-white font-bold">{botStats.todayTrades}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Posiciones</p>
            <p className="text-blue-500 font-bold">{botStats.activePositions}</p>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Configuración del Bot</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Inversión Máxima por Trade ($)
                </label>
                <input
                  type="number"
                  value={botConfig.maxInvestment}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, maxInvestment: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confianza Mínima (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={botConfig.minConfidence}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={botConfig.stopLoss}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={botConfig.takeProfit}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">Trading Automático</h4>
                <p className="text-gray-400 text-sm">Ejecutar trades automáticamente (¡CUIDADO!)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={botConfig.autoTrade}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, autoTrade: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            
            <button
              onClick={handleConfigSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Guardar Configuración
            </button>
          </div>
        )}

        {/* Active Signals for Bot */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Señales Elegibles para Bot</span>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
              {activeSignals.length}
            </span>
          </h3>
          
          {activeSignals.length === 0 ? (
            <div className="text-center py-6 bg-gray-700/20 rounded-lg">
              <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No hay señales que cumplan los criterios del bot</p>
              <p className="text-gray-500 text-sm">Ajusta la confianza mínima para ver más señales</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSignals.slice(0, 3).map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {signal.type === 'buy' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                    )}
                    
                    <div>
                      <p className="font-semibold text-white">
                        {signal.type.toUpperCase()} {signal.coin}
                      </p>
                      <p className="text-gray-400 text-sm">{signal.reason}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-white">${signal.price.toFixed(6)}</p>
                    <p className="text-green-500 text-sm">{Math.round(signal.confidence)}% confianza</p>
                  </div>
                  
                  {botActive && botConfig.autoTrade && (
                    <div className="ml-3">
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        AUTO
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-400 font-medium">⚠️ Advertencia Importante</span>
          </div>
          <p className="text-red-300 text-sm">
            El trading automático conlleva riesgos significativos. Este bot es solo para demostración. 
            Nunca inviertas más de lo que puedes permitirte perder. Siempre usa stop-loss y monitorea tus posiciones.
          </p>
        </div>
      </div>
    </div>
  );
}