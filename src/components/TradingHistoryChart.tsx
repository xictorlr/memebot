import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, Target, DollarSign } from 'lucide-react';

export default function TradingHistoryChart() {
  const [actions, setActions] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    avgDuration: 0,
    bestTrade: 0,
    worstTrade: 0
  });
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h'>('24h');

  // Fetch data from Supabase
  React.useEffect(() => {
    const fetchTradingHistory = async () => {
      try {
        setLoading(true);
        
        // Import supabase client
        const { supabase } = await import('../lib/supabase');
        
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
          .is('user_id', null) // Get general performance data (no user_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (performanceError) {
          console.error('Error fetching trading performance:', performanceError);
        } else {
          setPerformance(performanceData || []);
          
          // Calculate stats
          const closedTrades = (performanceData || []).filter(trade => trade.status === 'closed');
          
          if (closedTrades.length > 0) {
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
          }
        }
      } catch (error) {
        console.error('Error fetching trading history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingHistory();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTradingHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeframeHours = () => {
    switch (timeframe) {
      case '1h': return 1;
      case '6h': return 6;
      case '24h': return 24;
      default: return 24;
    }
  };

  const filteredActions = actions.filter(action => {
    const cutoff = new Date(Date.now() - getTimeframeHours() * 60 * 60 * 1000);
    return new Date(action.created_at) >= cutoff;
  });

  const actionCounts = {
    buy: filteredActions.filter(a => a.action === 'buy').length,
    sell: filteredActions.filter(a => a.action === 'sell').length,
    hold: filteredActions.filter(a => a.action === 'hold').length
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

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
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Historial de Trading</span>
          </h2>
          
          <div className="flex space-x-2">
            {(['1h', '6h', '24h'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Total Trades</p>
            <p className="text-white font-bold">{stats.totalTrades}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Win Rate</p>
            <p className={`font-bold ${stats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Total P&L</p>
            <p className={`font-bold ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.totalProfit)}
            </p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Avg Duration</p>
            <p className="text-white font-bold">{Math.round(stats.avgDuration)}m</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Best Trade</p>
            <p className="text-green-500 font-bold">{formatPercentage(stats.bestTrade)}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Worst Trade</p>
            <p className="text-red-500 font-bold">{formatPercentage(stats.worstTrade)}</p>
          </div>
        </div>

        {/* Action Distribution */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">Distribución de Acciones ({timeframe})</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-400 font-bold text-2xl">{actionCounts.buy}</p>
              <p className="text-green-300 text-sm">Señales BUY</p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
              <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400 font-bold text-2xl">{actionCounts.sell}</p>
              <p className="text-red-300 text-sm">Señales SELL</p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-400 font-bold text-2xl">{actionCounts.hold}</p>
              <p className="text-yellow-300 text-sm">Señales HOLD</p>
            </div>
          </div>
        </div>

        {/* Recent Actions */}
        <div>
          <h3 className="font-semibold text-white mb-3">Acciones Recientes</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredActions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay acciones en este período</p>
              </div>
            ) : (
              filteredActions.slice(0, 10).map((action) => (
                <div key={action.id} className={`p-3 rounded-lg border-l-4 ${
                  action.action === 'buy' ? 'border-l-green-500 bg-green-500/5' :
                  action.action === 'sell' ? 'border-l-red-500 bg-red-500/5' :
                  'border-l-yellow-500 bg-yellow-500/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {action.action === 'buy' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : action.action === 'sell' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Target className="h-4 w-4 text-yellow-500" />
                      )}
                      
                      <div>
                        <p className="font-semibold text-white">
                          {action.action.toUpperCase()} {action.symbol}
                        </p>
                        <p className="text-gray-400 text-sm">{action.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${action.price < 0.01 ? action.price.toFixed(6) : action.price.toFixed(4)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {action.confidence}% • {new Date(action.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}