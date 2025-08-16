import React from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onClearAll: () => void;
}

export default function AlertPanel({ alerts, onMarkAsRead, onClearAll }: AlertPanelProps) {
  const unreadAlerts = alerts.filter(alert => !alert.read);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'sell':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'buy':
        return 'border-l-green-500';
      case 'sell':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay alertas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Alertas</span>
            {unreadAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadAlerts.length}
              </span>
            )}
          </h2>
          {alerts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getAlertBorder(alert.type)} ${
                alert.read ? 'bg-gray-700/30' : 'bg-gray-700/50'
              } transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className={`font-semibold ${alert.read ? 'text-gray-400' : 'text-white'}`}>
                      {alert.coin} - {alert.type.toUpperCase()}
                    </p>
                    <p className={`text-sm mt-1 ${alert.read ? 'text-gray-500' : 'text-gray-300'}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-sm font-mono ${alert.read ? 'text-gray-500' : 'text-gray-400'}`}>
                        ${alert.price.toFixed(6)}
                      </span>
                      <span className={`text-xs ${alert.read ? 'text-gray-600' : 'text-gray-500'}`}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onMarkAsRead(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}