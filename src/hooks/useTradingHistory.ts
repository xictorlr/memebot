import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TradingAction {
  id: string;
  coin_id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  price: number;
  confidence: number;
  reason: string;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  rsi?: number;
  volume_spike: boolean;
  created_at: string;
}

interface TradingPerformance {
  id: string;
  coin_id: string;
  symbol: string;
  buy_price: number;
  sell_price?: number;
  buy_date: string;
  sell_date?: string;
  profit_loss: number;
  profit_loss_percentage: number;
  duration_minutes: number;
  status: 'open' | 'closed';
  created_at: string;
}

interface PerformanceStats {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgDuration: number;
  bestTrade: number;
  worstTrade: number;
}

export function useTradingHistory() {
  const [actions, setActions] = useState<TradingAction[]>([]);
  const [performance, setPerformance] = useState<TradingPerformance[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    avgDuration: 0,
    bestTrade: 0,
    worstTrade: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTradingHistory();
    
    // Refresh every 5 minutes to sync with new actions
    const interval = setInterval(fetchTradingHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTradingHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch recent trading actions (last 24 hours)
      const { data: actionsData, error: actionsError } = await supabase
        .from('trading_actions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionsError) {
        console.error('Error fetching trading actions:', actionsError);
      } else {
        setActions(actionsData || []);
      }

      // Fetch trading performance
      const { data: performanceData, error: performanceError } = await supabase
        .from('trading_performance')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (performanceError) {
        console.error('Error fetching trading performance:', performanceError);
      } else {
        setPerformance(performanceData || []);
        calculateStats(performanceData || []);
      }
    } catch (error) {
      console.error('Error fetching trading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (performanceData: TradingPerformance[]) => {
    const closedTrades = performanceData.filter(trade => trade.status === 'closed');
    
    if (closedTrades.length === 0) {
      setStats({
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0,
        avgDuration: 0,
        bestTrade: 0,
        worstTrade: 0
      });
      return;
    }

    const winningTrades = closedTrades.filter(trade => trade.profit_loss > 0);
    const totalProfit = closedTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
    const avgDuration = closedTrades.reduce((sum, trade) => sum + trade.duration_minutes, 0) / closedTrades.length;
    const bestTrade = Math.max(...closedTrades.map(trade => trade.profit_loss_percentage));
    const worstTrade = Math.min(...closedTrades.map(trade => trade.profit_loss_percentage));

    setStats({
      totalTrades: closedTrades.length,
      winRate: (winningTrades.length / closedTrades.length) * 100,
      totalProfit,
      avgDuration,
      bestTrade,
      worstTrade
    });
  };

  const saveAction = async (action: Omit<TradingAction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trading_actions')
        .insert(action)
        .select()
        .single();

      if (error) {
        console.error('Error saving trading action:', error);
        return { error };
      }

      // Update local state
      setActions(prev => [data, ...prev]);
      
      // Check if we need to create or update performance tracking
      await updatePerformanceTracking(action);
      
      return { data };
    } catch (error) {
      console.error('Error saving trading action:', error);
      return { error };
    }
  };

  const updatePerformanceTracking = async (action: Omit<TradingAction, 'id' | 'created_at'>) => {
    if (action.action === 'buy') {
      // Create new performance entry for buy action
      const { error } = await supabase
        .from('trading_performance')
        .insert({
          coin_id: action.coin_id,
          symbol: action.symbol,
          buy_price: action.price,
          buy_date: new Date().toISOString(),
          status: 'open'
        });

      if (error) {
        console.error('Error creating performance entry:', error);
      }
    } else if (action.action === 'sell') {
      // Find open position and close it
      const { data: openPosition } = await supabase
        .from('trading_performance')
        .select('*')
        .eq('coin_id', action.coin_id)
        .eq('status', 'open')
        .order('buy_date', { ascending: false })
        .limit(1)
        .single();

      if (openPosition) {
        const buyDate = new Date(openPosition.buy_date);
        const sellDate = new Date();
        const durationMinutes = Math.floor((sellDate.getTime() - buyDate.getTime()) / (1000 * 60));
        const profitLoss = action.price - openPosition.buy_price;
        const profitLossPercentage = ((action.price - openPosition.buy_price) / openPosition.buy_price) * 100;

        const { error } = await supabase
          .from('trading_performance')
          .update({
            sell_price: action.price,
            sell_date: sellDate.toISOString(),
            profit_loss: profitLoss,
            profit_loss_percentage: profitLossPercentage,
            duration_minutes: durationMinutes,
            status: 'closed'
          })
          .eq('id', openPosition.id);

        if (error) {
          console.error('Error updating performance entry:', error);
        }
      }
    }
  };

  const getActionsByTimeframe = (hours: number) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return actions.filter(action => new Date(action.created_at) >= cutoff);
  };

  const getPerformanceBySymbol = (symbol: string) => {
    return performance.filter(perf => perf.symbol.toLowerCase() === symbol.toLowerCase());
  };

  return {
    actions,
    performance,
    stats,
    loading,
    saveAction,
    getActionsByTimeframe,
    getPerformanceBySymbol,
    refetch: fetchTradingHistory
  };
}