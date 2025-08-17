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
  const [actionFilter, setActionFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');

  // Fetch data from Supabase
  React.useEffect(() => {
    const fetchTradingHistory = async () => {
      try {
        setLoading(true);
        
        // Import supabase client
        const { supabase } = await import('../lib/supabase');
        
        console.log('🔄 Fetching trading history from database...');
        console.log('📊 Current user:', user?.id || 'No user');
        
        // Fetch recent trading actions (last 24 hours)
        const { data: actionsData, error: actionsError } = await supabase
          .from('trading_actions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days instead of 24h
          .order('created_at', { ascending: false })
          .limit(500);

        if (actionsError) {
          console.error('Error fetching trading actions:', actionsError);
          console.error('Supabase error details:', actionsError);
          setActions([]);
        } else {
          console.log(`✅ Fetched ${actionsData?.length || 0} trading actions from database`);
          if (actionsData && actionsData.length > 0) {
            console.log('📊 Sample action:', actionsData[0]);
          }
          setActions(actionsData || []);
        }

        // Fetch trading performance (both user-specific and general)
        let performanceQuery = supabase
          .from('trading_performance')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        // If user is logged in, get their personal performance + general performance
        if (user) {
          const { data: userPerformance, error: userPerfError } = await supabase
            .from('trading_performance')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);
            
          const { data: generalPerformance, error: generalPerfError } = await supabase
            .from('trading_performance')
            .select('*')
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(50);
            
          if (!userPerfError && !generalPerfError) {
            const combinedPerformance = [...(userPerformance || []), ...(generalPerformance || [])];
            console.log(`✅ Fetched ${combinedPerformance.length} performance records (${userPerformance?.length || 0} personal + ${generalPerformance?.length || 0} general)`);
            setPerformance(combinedPerformance);
            calculateStats(combinedPerformance);
          } else {
            console.error('Error fetching performance:', userPerfError || generalPerfError);
            setPerformance([]);
          }
        } else {
          // If no user, get general performance only
          const { data: performanceData, error: performanceError } = await supabase
            .from('trading_performance')
            .select('*')
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(100);

          if (performanceError) {
            console.error('Error fetching trading performance:', performanceError);
            console.error('Supabase error details:', performanceError);
            setPerformance([]);
          } else {
            console.log(`✅ Fetched ${performanceData?.length || 0} performance records from database`);
            if (performanceData && performanceData.length > 0) {
              console.log('📊 Sample performance:', performanceData[0]);
            }
            setPerformance(performanceData || []);
            calculateStats(performanceData || []);
          }
        }
        
        // If no data exists, create some sample data for demonstration
        if ((!actionsData || actionsData.length === 0) && (!user)) {
          console.log('🎭 No data found, creating sample data...');
          await createSampleData(supabase);
        }
        
        const { data: performanceData, error: performanceError } = await supabase
          .from('trading_performance')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (performanceError) {
          console.error('Error fetching trading performance:', performanceError);
          setPerformance([]);
        } else {
          console.log(`✅ Fetched ${performanceData?.length || 0} performance records from database`);
          setPerformance(performanceData || []);
          calculateStats(performanceData || []);
        }
      } catch (error) {
        console.error('Error fetching trading history:', error);
        setActions([]);
        setPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    const createSampleData = async (supabase: any) => {
      try {
        console.log('🎭 Creating sample trading data...');
        
        // Create sample actions
        const sampleActions = [
          {
            coin_id: 'pepe',
            symbol: 'PEPE',
            action: 'buy',
            price: 0.000001234,
            confidence: 85,
            reason: 'Strong momentum with volume spike',
            market_cap: 2345678901,
            volume_24h: 234567890,
            price_change_24h: 12.45,
            rsi: 35.2,
            volume_spike: true
          },
          {
            coin_id: 'dogecoin',
            symbol: 'DOGE',
            action: 'sell',
            price: 0.08234,
            confidence: 78,
            reason: 'Overbought conditions detected',
            market_cap: 11234567890,
            volume_24h: 456789012,
            price_change_24h: -5.25,
            rsi: 72.8,
            volume_spike: false
          },
          {
            coin_id: 'shiba-inu',
            symbol: 'SHIB',
            action: 'hold',
            price: 0.000008234,
            confidence: 65,
            reason: 'Consolidation phase - wait for breakout',
            market_cap: 4567890123,
            volume_24h: 123456789,
            price_change_24h: 2.15,
            rsi: 55.4,
            volume_spike: false
          }
        ];
        
        const { error: actionsError } = await supabase
          .from('trading_actions')
          .insert(sampleActions);
          
        if (actionsError) {
          console.error('Error creating sample actions:', actionsError);
        } else {
          console.log('✅ Created sample trading actions');
        }
        
        // Create sample performance data
        const samplePerformance = [
          {
            coin_id: 'pepe',
            symbol: 'PEPE',
            buy_price: 0.000001000,
            sell_price: 0.000001200,
            buy_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            sell_date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
            profit_loss: 0.000000200,
            profit_loss_percentage: 20.0,
            duration_minutes: 90,
            status: 'closed',
            user_id: null // General performance
          },
          {
            coin_id: 'dogecoin',
            symbol: 'DOGE',
            buy_price: 0.085000,
            sell_price: 0.082000,
            buy_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            sell_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            profit_loss: -0.003000,
            profit_loss_percentage: -3.53,
            duration_minutes: 180,
            status: 'closed',
            user_id: null // General performance
          },
          {
            coin_id: 'shiba-inu',
            symbol: 'SHIB',
            buy_price: 0.000008000,
            buy_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            profit_loss: 0,
            profit_loss_percentage: 0,
            duration_minutes: 0,
            status: 'open',
            user_id: null // General performance
          }
        ];
        
        const { error: performanceError } = await supabase
          .from('trading_performance')
          .insert(samplePerformance);
          
        if (performanceError) {
          console.error('Error creating sample performance:', performanceError);
        } else {
          console.log('✅ Created sample performance data');
        }
        
        // Refresh data after creating samples
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Error creating sample data:', error);
      }
    };

    const calculateStats = (performanceData: any[]) => {
      const closedTrades = performanceData.filter(trade => trade.status === 'closed');
      
      if (closedTrades.length === 0) {
        console.log('📊 No closed trades found for stats calculation');
        console.log('📊 Total performance records:', performanceData.length);
        console.log('📊 Open trades:', performanceData.filter(trade => trade.status === 'open').length);
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

      console.log(`📊 Stats calculated: ${closedTrades.length} trades, ${winningTrades.length} wins, ${((winningTrades.length / closedTrades.length) * 100).toFixed(1)}% win rate`);
      console.log(`💰 Total profit: ${totalProfit}, Best: ${bestTrade}%, Worst: ${worstTrade}%`);
      
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
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTradingHistory, 2 * 60 * 1000); // Every 2 minutes for more frequent updates
    return () => clearInterval(interval);
  }, [user]); // Add user dependency

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

  const displayedActions = actionFilter === 'all' 
    ? filteredActions.slice(0, 15)
    : filteredActions.filter(a => a.action === actionFilter).slice(0, 15);

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