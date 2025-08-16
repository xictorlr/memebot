import React, { useState } from 'react';
import { MessageCircle, Clock, Save, TestTube, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

export default function TelegramConfig() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  
  const [config, setConfig] = useState({
    botToken: '8486768601:AAF9_1rbGsJ-r7Zq-y4lnt08QeAxAOBVFG0',
    chatId: '5441177022',
    enabled: true,
    frequency: profile?.alert_frequency?.toString() || '5' // minutes
  });
  const [testMessage, setTestMessage] = useState('🤖 Mensaje de prueba desde MemeBot\n\n✅ Tu bot está funcionando correctamente!');
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setConfig(prev => ({
        ...prev,
        botToken: '8486768601:AAF9_1rbGsJ-r7Zq-y4lnt08QeAxAOBVFG0',
        chatId: '5441177022',
        enabled: profile.alerts_enabled,
        frequency: profile.alert_frequency.toString()
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    if (user && profile) {
      const result = await updateProfile({
        telegram_bot_token: config.botToken,
        telegram_chat_id: config.chatId,
        alerts_enabled: config.enabled,
        alert_frequency: parseInt(config.frequency)
      });
      
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    }
  };

  const handleTest = async () => {
    setTesting(true);
    
    try {
      // Test both direct message and edge function
      console.log('🧪 Testing Telegram integration...');
      
      // First test: Direct Telegram API
      const directResponse = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: testMessage,
          parse_mode: 'Markdown'
        })
      });
      
      const directResult = await directResponse.json();
      
      if (directResult.ok) {
        console.log('✅ Direct Telegram API working');
        
        // Second test: Edge function
        try {
          const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-analyzer`;
          const edgeResponse = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            }
          });
          
          const edgeResult = await edgeResponse.json();
          
          if (edgeResult.success) {
            alert(`✅ ¡Todo funcionando perfectamente!\n\n📱 Mensaje directo: Enviado\n🤖 Análisis automático: Funcionando\n📊 Señales encontradas: ${edgeResult.signals?.length || 0}`);
          } else {
            alert(`⚠️ Mensaje directo enviado, pero hay un problema con el análisis automático:\n${edgeResult.error}`);
          }
        } catch (edgeError) {
          console.error('Edge function error:', edgeError);
          alert('✅ Mensaje directo enviado correctamente\n⚠️ Análisis automático necesita configuración adicional');
        }
      } else {
        alert('❌ Error: ' + (directResult.description || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setTesting(false);
    }
  };
  
  const handleRunAnalysis = async () => {
    setTesting(true);
    
    try {
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
        alert(`✅ ¡Análisis completado!\n\n📊 Señales encontradas: ${result.signals?.length || 0}\n📱 Mensaje enviado a Telegram\n⏰ ${new Date().toLocaleTimeString()}`);
      } else {
        alert(`❌ Error en el análisis:\n${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Manual analysis error:', error);
      alert(`❌ Error ejecutando análisis:\n${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Configuración Telegram Bot</h2>
          </div>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Inicia sesión para configurar alertas personalizadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MessageCircle className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Configuración Telegram Bot</h2>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h5 className="font-medium text-white mb-2">🤖 Alertas de Trading Automáticas</h5>
              <p className="text-gray-400 text-sm">Recibe señales de trading directamente en Telegram via @VictorLopezRapado_Alert_bot</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Frecuencia de análisis
            </label>
            <select
              value={config.frequency}
              onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="5">Cada 5 minutos</option>
              <option value="15">Cada 15 minutos</option>
              <option value="30">Cada 30 minutos</option>
              <option value="60">Cada hora</option>
              <option value="120">Cada 2 horas</option>
              <option value="240">Cada 4 horas</option>
              <option value="360">Cada 6 horas</option>
              <option value="720">Cada 12 horas</option>
              <option value="1440">Una vez al día</option>
            </select>
          </div>

          {/* Test Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 Mensaje de prueba personalizado
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Escribe tu mensaje de prueba aquí..."
            />
            <p className="text-gray-400 text-xs mt-2">
              💡 Puedes usar formato Markdown: *negrita*, _cursiva_, `código`
            </p>
          </div>

          {/* Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-medium">
                Bot @VictorLopezRapado_Alert_bot - Análisis Automático ACTIVO
              </span>
            </div>
            <p className="text-green-300 text-sm mt-2">
              {user ? `Usuario: ${user.email} • Frecuencia: cada ${config.frequency} min • Bot: @VictorLopezRapado_Alert_bot` : 'Conectado a @VictorLopezRapado_Alert_bot'}
            </p>
          </div>

          {/* Example Message Preview */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">📱 Vista previa del mensaje</h4>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
              <div className="whitespace-pre-line">
{`🤖 MEMEBOT TRADING ALERT 🤖
📅 16/01/2025 14:00

🎯 TOP 3 SEÑALES

🟢 1. PEPE 📈
💰 Precio: $0.000012
🎯 Acción: BUY
🔥 Confianza: 85%
📝 Razón: Oversold with volume spike
🚀 VOLUMEN ALTO detectado

🔴 2. SHIB 📉
💰 Precio: $0.000008
🎯 Acción: SELL
🔥 Confianza: 78%
📝 Razón: Overbought and declining

⚠️ RECORDATORIO
• Usa stop-loss siempre
• No inviertas más del 5% por trade
• DYOR - Esto es solo análisis técnico

🔄 Próximo análisis en 5 minutos`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              <span>{saved ? '✅ Guardado' : 'Guardar Configuración'}</span>
            </button>
            
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              onClick={handleTest}
              disabled={testing}
            >
              <TestTube className="h-4 w-4" />
              <span>{testing ? 'Enviando...' : 'Enviar Mensaje'}</span>
            </button>
            
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              disabled={testing}
              onClick={handleRunAnalysis}
            >
              <span>🤖</span>
              <span>{testing ? 'Analizando...' : 'Análisis Manual'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}