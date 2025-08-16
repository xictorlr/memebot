import React from 'react';
import { Bot, Bell, RefreshCw, TrendingUp, User, LogOut } from 'lucide-react';
import { APP_VERSION } from '../config/version';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  alertCount: number;
  lastUpdate: Date | null;
  onRefresh: () => void;
  loading: boolean;
  onAuthClick: () => void;
}

export default function Header({ alertCount, lastUpdate, onRefresh, loading, onAuthClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">MemeBot</h1>
              <span className="text-xs text-gray-400 font-mono">v{APP_VERSION}</span>
            </div>
          </div>
          <div className="hidden sm:block text-gray-400 text-sm">
            Trading automático de memecoins
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {lastUpdate ? `Actualizado: ${lastUpdate.toLocaleTimeString()}` : 'Cargando...'}
            </span>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <span className="text-white text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Crear Cuenta</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}