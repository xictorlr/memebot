import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  coins: string[];
  created_at: string;
  updated_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlists();
    } else {
      setWatchlists([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlists:', error);
      } else {
        setWatchlists(data || []);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWatchlist = async (name: string, coins: string[] = []) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          name,
          coins,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating watchlist:', error);
        return { error };
      } else {
        setWatchlists(prev => [data, ...prev]);
        return { data };
      }
    } catch (error) {
      console.error('Error creating watchlist:', error);
      return { error };
    }
  };

  const updateWatchlist = async (id: string, updates: Partial<Watchlist>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating watchlist:', error);
        return { error };
      } else {
        setWatchlists(prev => prev.map(w => w.id === id ? data : w));
        return { data };
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      return { error };
    }
  };

  const deleteWatchlist = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting watchlist:', error);
        return { error };
      } else {
        setWatchlists(prev => prev.filter(w => w.id !== id));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      return { error };
    }
  };

  const addCoinToWatchlist = async (watchlistId: string, coinId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist || watchlist.coins.includes(coinId)) return;

    const updatedCoins = [...watchlist.coins, coinId];
    return updateWatchlist(watchlistId, { coins: updatedCoins });
  };

  const removeCoinFromWatchlist = async (watchlistId: string, coinId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return;

    const updatedCoins = watchlist.coins.filter(c => c !== coinId);
    return updateWatchlist(watchlistId, { coins: updatedCoins });
  };

  return {
    watchlists,
    loading,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addCoinToWatchlist,
    removeCoinFromWatchlist,
    refetch: fetchWatchlists,
  };
}