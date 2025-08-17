import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, Target, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TradingHistoryChart() {
  const { user } = useAuth();
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
  const [actionFilter, setActionFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');

  // Fetch data from Supabase
  React.useEffect(() => {
    const fetchTradingHistory = async () => {
      try {
        setLoading(true);
        
        // Import supabase client
        const { supabase } = await import('../lib/supabase');
        
        console.log('🔄 Fetching trading history from database...');
        
        // Fetch recent trading actions (last 7 days)
        const { data: actionsData, error: actionsError } = await supabase
          .from('trading_actions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1000);

        if (actionsError) {
          console.error('❌ Error fetching trading actions:', actionsError);
          setActions([]);
        } else {
          console.log(`✅ Fetched ${actionsData?.length || 0} trading actions`);
          setActions(actionsData || []);
          
          // Calculate stats from actions if no performance data
          if (actionsData && actionsData.length > 0) {
            calculateStatsFromActions(actionsData);
          }
        }

        // Try to fetch performance data
        const { data: performanceData, error: performanceError } = await supabase
          .from('trading_performance')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!performanceError && performanceData && performanceData.length > 0) {
          console.log(`✅ Using real performance data: ${performanceData.length} records`);
          setPerformance(performanceData);
          calculateStatsFromPerformance(performanceData);
        } else {
          console.log('⚠️ No performance data, using simulated stats from actions');
          setPerformance([]);
        }
        
      } catch (error) {
        console.error('❌ Error fetching trading history:', error);
        setActions([]);
        setPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    const calculateStatsFromActions = (actionsData: any[]) => {
      console.log('📊 Calculating stats from actions data...');
      
      const buyActions = actionsData.filter(a => a.action === 'buy');
      const sellActions = actionsData.filter(a => a.action === 'sell');
      
      if (buyActions.length === 0) {
        console.log('⚠️ No BUY actions found');
        return;
      }
      
      // Simulate trades based on confidence levels
      const simulatedTrades = buyActions.map((buyAction, index) => {
        const confidence = buyAction.confidence || 50;
        
        // Higher confidence = better simulated performance
        const baseReturn = (confidence - 50) / 100; // -0.5 to +0.5
        const randomFactor = (Math.random() - 0.5) * 0.3; // ±15% random
        const finalReturn = baseReturn + randomFactor;
        
        // Simulate profit/loss
        const investmentAmount = 100; // $100 per trade
        const profitLoss = investmentAmount * finalReturn;
        const profitLossPercentage = finalReturn * 100;
        
        // Simulate duration (30min to 4 hours)
        const duration = 30 + Math.random() * 210;
        
        return {
          id: `sim-${index}`,
          profit_loss: profitLoss,
          profit_loss_percentage: profitLossPercentage,
          duration_minutes: duration,
          status: 'closed'
        };
      });
      
      // Calculate stats from simulated trades
      const winningTrades = simulatedTrades.filter(t => t.profit_loss > 0);
      const totalProfit = simulatedTrades.reduce((sum, t) => sum + t.profit_loss, 0);
      const avgDuration = simulatedTrades.reduce((sum, t) => sum + t.duration_minutes, 0) / simulatedTrades.length;
      const bestTrade = Math.max(...simulatedTrades.map(t => t.profit_loss_percentage));
      const worstTrade = Math.min(...simulatedTrades.map(t => t.profit_loss_percentage));
      const winRate = (winningTrades.length / simulatedTrades.length) * 100;
      
      console.log(`📈 Simulated stats: ${simulatedTrades.length} trades, ${winRate.toFixed(1)}% win rate, $${totalProfit.toFixed(2)} P&L`);
      
      setStats({
        totalTrades: simulatedTrades.length,
        winRate,
        totalProfit,
        avgDuration,
        bestTrade,
        worstTrade
      });
    };

    const calculateStatsFromPerformance = (performanceData: any[]) => {
      const closedTrades = performanceData.filter(trade => trade.status === 'closed');
      
      if (closedTrades.length === 0) {
        console.log('📊 No closed trades in performance data');
        return;
      }

      const winningTrades = closedTrades.filter(trade => trade.profit_loss > 0);
      const totalProfit = closedTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
      const avgDuration = closedTrades.reduce((sum, trade) => sum + trade.duration_minutes, 0) / closedTrades.length;
      const bestTrade = Math.max(...closedTrades.map(trade => trade.profit_loss_percentage));
      const worstTrade = Math.min(...closedTrades.map(trade => trade.profit_loss_percentage));

      console.log(`📊 Real stats: ${closedTrades.length} trades, ${((winningTrades.length / closedTrades.length) * 100).toFixed(1)}% win rate`);
      
      setStats({
        totalTrades: closedTrades.length,
        winRate: (winningTrades.length / closedTrades.length) * 100,
        totalProfit,
        avgDuration,
        bestTrade,
        worstTrade
      });
    };

    fetchTradingHistory();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchTradingHistory, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const getTimeframeHours = () => {
    switch (timeframe) {
      case '1h': return 1;
      case '6h': return 6;
      case '24h': return 24;
      default: return 24;
    }
  };

  const filteredActions = React.useMemo(() => {
    const cutoff = new Date(Date.now() - getTimeframeHours() * 60 * 60 * 1000);
    const filtered = actions.filter(action => {
      const actionDate = new Date(action.created_at);
      return actionDate >= cutoff;
    });
    
    console.log(`🔍 Filtering actions for ${timeframe}:`);
    console.log(`   📅 Cutoff: ${cutoff.toLocaleString()}`);
    console.log(`   📊 Total actions: ${actions.length}`);
    console.log(`   ✅ Filtered actions: ${filtered.length}`);
    
    return filtered;
  }, [actions, timeframe]);

  const actionCounts = {
    buy: filteredActions.filter(a => a.action === 'buy').length,
    sell: filteredActions.filter(a => a.action === 'sell').length,
    hold: filteredActions.filter(a => a.action === 'hold').length
  };

  const displayedActions = actionFilter === 'all' 
    ? filteredActions.slice(0, 15)
    : filteredActions.filter(a => a.action === actionFilter).slice(0, 15);

  // Calculate BUY signals per coin
  const buySignalsByCoin = React.useMemo(() => {
    const buyActions = filteredActions.filter(a => a.action === 'buy');
    const coinCounts: { [key: string]: number } = {};
    
    buyActions.forEach(action => {
      const symbol = action.symbol || action.coin_id;
      coinCounts[symbol] = (coinCounts[symbol] || 0) + 1;
    });
    
    // Sort by count descending
    return Object.entries(coinCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10
  }, [filteredActions]);

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

        {/* BUY Signals by Coin */}
        {buySignalsByCoin.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">
              🟢 Señales BUY por Coin ({timeframe}) - {filteredActions.filter(a => a.action === 'buy').length} total
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {buySignalsByCoin.map(([coin, count]) => (
                <div key={coin} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-green-400 font-bold text-lg">{count}</p>
                  <p className="text-green-300 text-sm font-medium">{coin.toUpperCase()}</p>
                  <p className="text-green-200 text-xs">
                    {((count / actionCounts.buy) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Actions */}
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <span>Historial de Señales</span>
            <span className="text-sm text-gray-400">({timeframe})</span>
          </h3>
          
          {/* Action Type Filter */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActionFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                actionFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todas ({filteredActions.length})
            </button>
            <button
              onClick={() => setActionFilter('buy')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                actionFilter === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              BUY ({actionCounts.buy})
            </button>
            <button
              onClick={() => setActionFilter('sell')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                actionFilter === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              SELL ({actionCounts.sell})
            </button>
            <button
              onClick={() => setActionFilter('hold')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                actionFilter === 'hold'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              HOLD ({actionCounts.hold})
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {displayedActions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {actionFilter === 'all' 
                    ? 'No hay señales en este período' 
                    : `No hay señales ${actionFilter.toUpperCase()} en este período`
                  }
                </p>
              </div>
            ) : (
              displayedActions.map((action) => (
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
                        <div className="flex items-center space-x-2">
                          <p className={`font-semibold ${
                            action.action === 'buy' ? 'text-green-400' :
                            action.action === 'sell' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {action.action === 'buy' ? '🟢 COMPRAR' :
                             action.action === 'sell' ? '🔴 VENDER' :
                             '🟡 MANTENER'} {action.symbol}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            action.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                            action.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {action.confidence}%
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1 font-medium">
                          📝 {action.reason}
                        </p>
                        {action.rsi && (
                          <p className="text-gray-400 text-xs mt-1">
                            📊 RSI: {action.rsi.toFixed(1)} 
                            {action.volume_spike && ' • 🚀 Alto volumen'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white text-lg">
                        ${action.price < 0.01 ? action.price.toFixed(6) : action.price.toFixed(4)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(action.created_at).toLocaleTimeString()}
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