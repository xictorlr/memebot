import React, { useState } from 'react';
import { Plus, Star, Trash2, Edit3, Save, X } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../hooks/useAuth';

interface WatchlistManagerProps {
  availableCoins: Array<{ id: string; symbol: string; name: string }>;
}

export default function WatchlistManager({ availableCoins }: WatchlistManagerProps) {
  const { user } = useAuth();
  const { watchlists, loading, createWatchlist, updateWatchlist, deleteWatchlist, addCoinToWatchlist, removeCoinFromWatchlist } = useWatchlist();
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center">
          <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Inicia sesión para crear watchlists personalizadas</p>
        </div>
      </div>
    );
  }

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;

    const result = await createWatchlist(newWatchlistName, selectedCoins);
    if (!result?.error) {
      setNewWatchlistName('');
      setSelectedCoins([]);
      setShowCreateForm(false);
    }
  };

  const handleUpdateWatchlist = async (id: string) => {
    if (!editingName.trim()) return;

    const result = await updateWatchlist(id, { name: editingName });
    if (!result?.error) {
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta watchlist?')) {
      await deleteWatchlist(id);
    }
  };

  const toggleCoinInWatchlist = async (watchlistId: string, coinId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return;

    if (watchlist.coins.includes(coinId)) {
      await removeCoinFromWatchlist(watchlistId, coinId);
    } else {
      await addCoinToWatchlist(watchlistId, coinId);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
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
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Mis Watchlists</span>
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateWatchlist} className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la watchlist
              </label>
              <input
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Mi nueva watchlist"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seleccionar coins (opcional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableCoins.slice(0, 20).map((coin) => (
                  <label key={coin.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCoins.includes(coin.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCoins(prev => [...prev, coin.id]);
                        } else {
                          setSelectedCoins(prev => prev.filter(c => c !== coin.id));
                        }
                      }}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{coin.symbol.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Crear</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewWatchlistName('');
                  setSelectedCoins([]);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        )}

        {/* Watchlists */}
        <div className="space-y-4">
          {watchlists.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tienes watchlists aún</p>
              <p className="text-gray-500 text-sm">Crea tu primera watchlist para organizar tus coins favoritas</p>
            </div>
          ) : (
            watchlists.map((watchlist) => (
              <div key={watchlist.id} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {editingId === watchlist.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleUpdateWatchlist(watchlist.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-white">{watchlist.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(watchlist.id);
                            setEditingName(watchlist.name);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWatchlist(watchlist.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {watchlist.coins.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay coins en esta watchlist</p>
                  ) : (
                    watchlist.coins.map((coinId) => {
                      const coin = availableCoins.find(c => c.id === coinId);
                      return (
                        <span
                          key={coinId}
                          className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium"
                        >
                          {coin?.symbol.toUpperCase() || coinId}
                        </span>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-gray-400 text-xs">
                    {watchlist.coins.length} coins • Creada {new Date(watchlist.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}