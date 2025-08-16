import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface PortfolioEntry {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  amount: number;
  buy_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  created_at: string;
  updated_at: string;
}

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else {
      setPortfolio([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolio:', error);
      } else {
        setPortfolio(data || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioEntry = async (
    coinId: string,
    symbol: string,
    amount: number,
    buyPrice: number
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .insert({
          user_id: user.id,
          coin_id: coinId,
          symbol: symbol.toUpperCase(),
          amount,
          buy_price: buyPrice,
          current_price: buyPrice,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding portfolio entry:', error);
        return { error };
      } else {
        setPortfolio(prev => [data, ...prev]);
        return { data };
      }
    } catch (error) {
      console.error('Error adding portfolio entry:', error);
      return { error };
    }
  };

  const updatePortfolioEntry = async (id: string, updates: Partial<PortfolioEntry>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating portfolio entry:', error);
        return { error };
      } else {
        setPortfolio(prev => prev.map(p => p.id === id ? data : p));
        return { data };
      }
    } catch (error) {
      console.error('Error updating portfolio entry:', error);
      return { error };
    }
  };

  const deletePortfolioEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolio_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting portfolio entry:', error);
        return { error };
      } else {
        setPortfolio(prev => prev.filter(p => p.id !== id));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting portfolio entry:', error);
      return { error };
    }
  };

  const updatePrices = async (priceUpdates: { [coinId: string]: number }) => {
    if (!user) return;

    const updates = portfolio.map(entry => {
      const currentPrice = priceUpdates[entry.coin_id];
      if (currentPrice) {
        const profitLoss = (currentPrice - entry.buy_price) * entry.amount;
        const profitLossPercentage = ((currentPrice - entry.buy_price) / entry.buy_price) * 100;
        
        return {
          ...entry,
          current_price: currentPrice,
          profit_loss: profitLoss,
          profit_loss_percentage: profitLossPercentage,
        };
      }
      return entry;
    });

    // Update all entries in batch
    for (const entry of updates) {
      if (entry.current_price !== portfolio.find(p => p.id === entry.id)?.current_price) {
        await updatePortfolioEntry(entry.id, {
          current_price: entry.current_price,
          profit_loss: entry.profit_loss,
          profit_loss_percentage: entry.profit_loss_percentage,
        });
      }
    }
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, entry) => total + (entry.current_price * entry.amount), 0);
  };

  const getTotalProfitLoss = () => {
    return portfolio.reduce((total, entry) => total + entry.profit_loss, 0);
  };

  const getTotalProfitLossPercentage = () => {
    const totalInvested = portfolio.reduce((total, entry) => total + (entry.buy_price * entry.amount), 0);
    const totalCurrent = getTotalValue();
    
    if (totalInvested === 0) return 0;
    return ((totalCurrent - totalInvested) / totalInvested) * 100;
  };

  return {
    portfolio,
    loading,
    addPortfolioEntry,
    updatePortfolioEntry,
    deletePortfolioEntry,
    updatePrices,
    getTotalValue,
    getTotalProfitLoss,
    getTotalProfitLossPercentage,
    refetch: fetchPortfolio,
  };
}