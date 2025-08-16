import React, { useState } from 'react';
import { Bell, Plus, Trash2, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Memecoin } from '../types';

interface PriceAlert {
  id: string;
  coinId: string;
  coinSymbol: string;
  targetPrice: number;
  currentPrice: number;
  type: 'above' | 'below';
  active: boolean;
  createdAt: string;
}

interface PriceAlertsProps {
  memecoins: Memecoin[];
}

export default function PriceAlerts({ memecoins }: PriceAlertsProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      coinId: 'dogecoin',
      coinSymbol: 'DOGE',
      targetPrice: 0.10,
      currentPrice: 0.08234,
      type: 'above',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      coinId: 'pepe',
      coinSymbol: 'PEPE',
      targetPrice: 0.000001000,
      currentPrice: 0.000001234,
      type: 'below',
      active: true,
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Inicia sesión para crear alertas de precio</p>
        </div>
      </div>
    );
  }

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !targetPrice) return;

    const coin = memecoins.find(c => c.id === selectedCoin);
    if (!coin) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      coinId: selectedCoin,
      coinSymbol: coin.symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      currentPrice: coin.current_price,
      type: alertType,
      active: true,
      createdAt: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);
    setSelectedCoin('');
    setTargetPrice('');
    setShowCreateForm(false);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const getAlertStatus = (alert: PriceAlert) => {
    const coin = memecoins.find(c => c.id === alert.coinId);
    const currentPrice = coin?.current_price || alert.currentPrice;
    
    if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
      return { triggered: true, message: 'Precio alcanzado!' };
    }
    if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
      return { triggered: true, message: 'Precio alcanzado!' };
    }
    
    const diff = alert.type === 'above' 
      ? ((alert.targetPrice - currentPrice) / currentPrice * 100)
      : ((currentPrice - alert.targetPrice) / alert.targetPrice * 100);
    
    return { 
      triggered: false, 
      message: `${Math.abs(diff).toFixed(1)}% ${alert.type === 'above' ? 'para subir' : 'para bajar'}` 
    };
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toFixed(8)}`;
    if (price < 0.001) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <span>Alertas de Precio</span>
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateAlert} className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coin
                </label>
                <select
                  value={selectedCoin}
                  onChange={(e) => {
                    setSelectedCoin(e.target.value);
                    const coin = memecoins.find(c => c.id === e.target.value);
                    if (coin) setTargetPrice(coin.current_price.toString());
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  required
                >
                  <option value="">Seleccionar coin</option>
                  {memecoins.slice(0, 20).map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.symbol.toUpperCase()} - {formatPrice(coin.current_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio Objetivo
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Alerta
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="above">Precio por encima</option>
                  <option value="below">Precio por debajo</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Crear Alerta
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tienes alertas de precio</p>
              <p className="text-gray-500 text-sm">Crea alertas para recibir notificaciones cuando los precios cambien</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const status = getAlertStatus(alert);
              const coin = memecoins.find(c => c.id === alert.coinId);
              const currentPrice = coin?.current_price || alert.currentPrice;
              
              return (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                  status.triggered ? 'border-l-green-500 bg-green-500/10' : 
                  alert.active ? 'border-l-orange-500 bg-gray-700/30' : 'border-l-gray-500 bg-gray-700/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {alert.type === 'above' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-white">
                          {alert.coinSymbol} {alert.type === 'above' ? '↗️' : '↘️'} {formatPrice(alert.targetPrice)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Precio actual: {formatPrice(currentPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`font-semibold ${status.triggered ? 'text-green-500' : 'text-gray-400'}`}>
                          {status.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alert.active}
                          onChange={() => toggleAlert(alert.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}