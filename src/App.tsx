import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import MemecoinList from './components/MemecoinList';
import TradingSignals from './components/TradingSignals';
import AlertPanel from './components/AlertPanel';
import AuthModal from './components/AuthModal';
import WatchlistManager from './components/WatchlistManager';
import Portfolio from './components/Portfolio';
import MarketSentiment from './components/MarketSentiment';
import WhaleTracker from './components/WhaleTracker';
import TradingHistoryChart from './components/TradingHistoryChart';
import TelegramConfig from './components/TelegramConfig';
import { useTradingData } from './hooks/useTradingData';
import { useAuth } from './hooks/useAuth';
import { APP_VERSION, getLatestChanges } from './config/version';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const {
    memecoins,
    signals,
    alerts,
    loading,
    lastUpdate,
    lastTelegramAnalysis,
    refetch,
    runTelegramAnalysis,
    markAlertAsRead,
    clearAllAlerts
  } = useTradingData();

  const unreadAlerts = alerts.filter(alert => !alert.read);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando MemeBot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        alertCount={unreadAlerts.length}
        lastUpdate={lastUpdate}
        onRefresh={refetch}
        loading={loading}
        onAuthClick={() => setShowAuthModal(true)}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StatsCards memecoins={memecoins} signals={signals} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MarketSentiment memecoins={memecoins} />
          <WhaleTracker memecoins={memecoins} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MemecoinList memecoins={memecoins} loading={loading} />
          <AlertPanel
            alerts={alerts.slice(0, 10)} // Show only last 10 alerts
            onMarkAsRead={markAlertAsRead}
            onClearAll={clearAllAlerts}
          />
        </div>
        
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <WatchlistManager 
              availableCoins={memecoins.map(coin => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name
              }))}
            />
            <Portfolio 
              availableCoins={memecoins.map(coin => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                current_price: coin.current_price
              }))}
            />
          </div>
        )}
        
        <div className="mb-8">
          <TradingHistoryChart />
        </div>
        
        <div className="mb-8">
          <TelegramConfig />
        </div>
        
        <TradingSignals signals={signals} />
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Version Info */}
          <div className="mb-8 text-center">
            <div className="bg-gray-800 rounded-lg p-4 inline-block">
              <h4 className="text-lg font-semibold text-white mb-2">
                🚀 MemeBot v{APP_VERSION}
              </h4>
              <div className="text-sm text-gray-400 space-y-1">
                {getLatestChanges().slice(0, 3).map((change, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2">
                    <span>{change}</span>
                  </div>
                ))}
                {getLatestChanges().length > 3 && (
                  <div className="text-xs text-gray-500 mt-2">
                    +{getLatestChanges().length - 3} cambios más...
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">APIs Recomendadas para Trading de Memecoins</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🥇 DexScreener API</h4>
                <p className="text-sm">
                  La mejor API para tracking de memecoins en DEX. Datos en tiempo real, 
                  perfect para tokens nuevos y pumps. Incluye datos de liquidez y volume.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🥈 CoinGecko API</h4>
                <p className="text-sm">
                  API gratuita con datos confiables de precios, market cap y volumen. 
                  Ideal para memecoins establecidas. Rate limit generoso.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🥉 Moralis API</h4>
                <p className="text-sm">
                  Perfect para análisis on-chain y tracking de wallets. 
                  Permite seguir ballenas y detectar movimientos tempranos.
                </p>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center justify-center space-x-2">
                <span>👨‍💻</span>
                <span>Desarrollado por Víctor López Rapado</span>
              </h4>
              
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <a
                  href="https://xictorlr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>🌐</span>
                  <span>Mi Web</span>
                </a>
                
                <a
                  href="https://www.linkedin.com/in/victorlopezrapado/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>💼</span>
                  <span>LinkedIn</span>
                </a>
                
                <a
                  href="https://github.com/xictorlr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>⚡</span>
                  <span>GitHub</span>
                </a>
                
                <a
                  href="https://www.instagram.com/stories/xictorlr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>📸</span>
                  <span>Instagram</span>
                </a>
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  🚀 Full Stack Developer especializado en Trading Bots y Fintech
                </p>
                <p className="text-gray-500 text-xs">
                  💡 ¿Necesitas un bot personalizado? ¡Contáctame!
                </p>
              </div>
            </div>
            
            {!user && (
              <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">🚀 Funcionalidades Premium</h4>
                <p className="text-sm text-blue-300">
                  Crea una cuenta gratuita para acceder a watchlists personalizadas, 
                  portfolio tracking, alertas configurables y más funcionalidades avanzadas.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Crear Cuenta Gratis
                </button>
              </div>
            )}
            
            <p className="mt-6 text-sm text-gray-500">
              ⚠️ Trading automatizado conlleva riesgos. Usa stop-loss y nunca inviertas más de lo que puedes permitirte perder.
            </p>
          </div>
      </footer>
    </div>
  );
}

export default App;