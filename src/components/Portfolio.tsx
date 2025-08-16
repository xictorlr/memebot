import React, { useState } from 'react';
import { PieChart, Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';

interface PortfolioProps {
  availableCoins: Array<{ id: string; symbol: string; name: string; current_price: number }>;
}

export default function Portfolio({ availableCoins }: PortfolioProps) {
  const { user } = useAuth();
  const { 
    portfolio, 
    loading, 
    addPortfolioEntry, 
    deletePortfolioEntry,
    getTotalValue,
    getTotalProfitLoss,
    getTotalProfitLossPercentage
  } = usePortfolio();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center">
          <PieChart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Inicia sesión para trackear tu portfolio</p>
        </div>
      </div>
    );
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !amount || !buyPrice) return;

    const coin = availableCoins.find(c => c.id === selectedCoin);
    if (!coin) return;

    const result = await addPortfolioEntry(
      selectedCoin,
      coin.symbol,
      parseFloat(amount),
      parseFloat(buyPrice)
    );

    if (!result?.error) {
      setSelectedCoin('');
      setAmount('');
      setBuyPrice('');
      setShowAddForm(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      await deletePortfolioEntry(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const totalValue = getTotalValue();
  const totalProfitLoss = getTotalProfitLoss();
  const totalProfitLossPercentage = getTotalProfitLossPercentage();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-green-500" />
            <span>Mi Portfolio</span>
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Portfolio Summary */}
        {portfolio.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-gray-400 text-sm">Valor Total</span>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-gray-400 text-sm">P&L Total</span>
              </div>
              <p className={`text-xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalProfitLoss)}
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {totalProfitLossPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-gray-400 text-sm">P&L %</span>
              </div>
              <p className={`text-xl font-bold ${totalProfitLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalProfitLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddEntry} className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coin
                </label>
                <select
                  value={selectedCoin}
                  onChange={(e) => {
                    setSelectedCoin(e.target.value);
                    const coin = availableCoins.find(c => c.id === e.target.value);
                    if (coin) setBuyPrice(coin.current_price.toString());
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Seleccionar coin</option>
                  {availableCoins.slice(0, 50).map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.symbol.toUpperCase()} - {coin.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio de Compra
                </label>
                <input
                  type="number"
                  step="any"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Añadir al Portfolio
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Portfolio Entries */}
        <div className="space-y-3">
          {portfolio.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Tu portfolio está vacío</p>
              <p className="text-gray-500 text-sm">Añade tus primeras posiciones para empezar a trackear</p>
            </div>
          ) : (
            portfolio.map((entry) => (
              <div key={entry.id} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-white">{entry.symbol}</h3>
                      <p className="text-gray-400 text-sm">{entry.amount} tokens</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-white font-semibold">
                          {formatCurrency(entry.current_price * entry.amount)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Compra: {formatCurrency(entry.buy_price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold ${entry.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(entry.profit_loss)}
                        </p>
                        <p className={`text-sm ${entry.profit_loss_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.profit_loss_percentage.toFixed(2)}%
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}