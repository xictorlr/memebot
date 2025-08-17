import { useState, useEffect } from 'react';
import { TradingAPI } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';
import type { Memecoin, TradingSignal, Alert } from '../types';

export function useTradingData() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastTelegramAnalysis, setLastTelegramAnalysis] = useState<Date | null>(null);

  const api = TradingAPI.getInstance();

  // Function to save trading signals to database
  const saveTradingSignals = async (signals: TradingSignal[], coinData: Memecoin[]) => {
    try {
      const actions = signals.map(signal => {
        // Find the corresponding coin data for market metrics
        const coin = coinData.find(c => 
          c.symbol.toLowerCase() === signal.coin.toLowerCase() ||
          c.id.toLowerCase() === signal.coin.toLowerCase()
        );
        
        return {
          coin_id: signal.coin.toLowerCase(),
          symbol: signal.coin,
          action: signal.type,
          price: signal.price,
          confidence: Math.round(signal.confidence),
          reason: signal.reason,
          market_cap: coin?.market_cap || 0,
          volume_24h: coin?.total_volume || coin?.volume_24h || 0,
          price_change_24h: coin?.price_change_percentage_24h || 0,
          rsi: null,
          volume_spike: (coin?.total_volume || coin?.volume_24h || 0) > 1000000
        };
      });

      const { error } = await supabase
        .from('trading_actions')
        .insert(actions);

      if (error) {
        console.error('❌ Error saving trading signals:', error);
      } else {
        console.log(`✅ Saved ${actions.length} trading signals to database`);
      }
    } catch (error) {
      console.error('❌ Error in saveTradingSignals:', error);
    }
  };

  // Función para ejecutar análisis automático de Telegram
  const runTelegramAnalysis = async () => {
    if (!user || !profile?.alerts_enabled) return;
    
    try {
      console.log('🤖 Ejecutando análisis automático de Telegram...');
      
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-analyzer`;
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Análisis automático completado: ${result.signals?.length || 0} señales`);
        setLastTelegramAnalysis(new Date());
      } else {
        console.error('❌ Error en análisis automático:', result.error);
      }
    } catch (error) {
      console.error('❌ Error ejecutando análisis automático:', error);
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const coinData = await api.getMemecoins();
      setMemecoins(coinData);
      
      console.log(`📊 Fetched ${coinData.length} coins for analysis`);
      
      // Generate trading signals
      const newSignals = api.generateTradingSignals(coinData);
      console.log(`🎯 Generated ${newSignals.length} new signals`);
      
      // Save signals to database (public data)
      await saveTradingSignals(newSignals, coinData);
      
      setSignals(prev => [...newSignals, ...prev].slice(0, 50)); // Keep last 50 signals
      
      // Generate alerts from new signals
      const newAlerts = newSignals.map(signal => ({
        id: `alert-${signal.id}`,
        type: signal.type,
        coin: signal.coin,
        message: `${signal.type.toUpperCase()} signal for ${signal.coin}: ${signal.reason}`,
        price: signal.price,
        timestamp: signal.timestamp,
        read: false
      } as Alert));
      
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 100)); // Keep last 100 alerts
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Efecto para análisis automático de Telegram
  useEffect(() => {
    if (!user || !profile?.alerts_enabled) return;
    
    const frequencyMinutes = profile.alert_frequency || 60; // Default 1 hora
    const intervalMs = frequencyMinutes * 60 * 1000;
    
    // Ejecutar inmediatamente si es la primera vez
    if (!lastTelegramAnalysis) {
      setTimeout(() => runTelegramAnalysis(), 5000); // Esperar 5 segundos después del login
    }
    
    // Configurar intervalo automático
    const telegramInterval = setInterval(() => {
      runTelegramAnalysis();
    }, intervalMs);
    
    console.log(`🤖 Análisis automático configurado cada ${frequencyMinutes} minutos`);
    
    return () => clearInterval(telegramInterval);
  }, [user, profile?.alerts_enabled, profile?.alert_frequency]);
  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    memecoins,
    signals,
    alerts,
    loading,
    lastUpdate,
    lastTelegramAnalysis,
    refetch: fetchData,
    runTelegramAnalysis,
    markAlertAsRead,
    clearAllAlerts
  };
}