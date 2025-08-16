# 🤖 MemeBot - Plataforma de Trading Automático

[![Version](https://img.shields.io/badge/version-0.6.0-blue.svg)](https://github.com/yourusername/memebot)
[![Telegram](https://img.shields.io/badge/Telegram-@VictorLopezRapado_Alert_bot-blue.svg)](https://t.me/VictorLopezRapado_Alert_bot)
[![Live Demo](https://img.shields.io/badge/Live-xictorlrbot.com-green.svg)](https://xictorlrbot.com)

Plataforma avanzada de trading automático para memecoins con análisis en tiempo real y alertas por Telegram.

## 🚀 Características Principales

- **📊 Dashboard en Tiempo Real** - Tracking de +200 memecoins
- **🤖 Análisis Automático** - Señales de trading cada 5-60 minutos
- **📱 Alertas Telegram** - Notificaciones automáticas vía bot
- **🐋 Whale Tracker** - Seguimiento de movimientos grandes
- **💼 Portfolio Tracking** - Gestión de inversiones con P&L
- **⭐ Watchlists** - Listas personalizadas de seguimiento
- **🎯 Alertas de Precio** - Notificaciones personalizables
- **📈 Análisis Técnico** - RSI, volumen, momentum

## 🛠️ Configuración de GitHub Actions

### 1. Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions y añade:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2. Personalizar Frecuencia

Edita `.github/workflows/telegram-alerts.yml`:

```yaml
# Cada 5 minutos
- cron: '*/5 * * * *'

# Cada 15 minutos
- cron: '*/15 * * * *'

# Cada hora
- cron: '0 * * * *'

# Cada 6 horas
- cron: '0 */6 * * *'
```

### 3. Verificar Funcionamiento

- Ve a Actions en tu repositorio de GitHub
- Verás el workflow "Telegram Trading Alerts"
- Puedes ejecutarlo manualmente con "Run workflow"
- Los logs mostrarán si las alertas se enviaron correctamente

## 📱 Bot de Telegram

**Bot:** [@VictorLopezRapado_Alert_bot](https://t.me/VictorLopezRapado_Alert_bot)

### Ejemplo de Mensaje Automático:

```
🤖 MEMEBOT TRADING ALERT 🤖
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

🔄 Próximo análisis en 5 minutos
```

## 🏗️ Tecnologías

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Database + Auth + Edge Functions)
- **APIs:** CoinGecko, Telegram Bot API
- **Deployment:** Bolt Hosting
- **Automation:** GitHub Actions

## 🚨 Disclaimer

⚠️ **IMPORTANTE:** Este bot es solo para fines educativos y de demostración. El trading de criptomonedas conlleva riesgos significativos. Nunca inviertas más de lo que puedes permitirte perder. Siempre usa stop-loss y haz tu propia investigación (DYOR).

## 📊 Cobertura de Mercado

- **Solana Ecosystem:** BONK, WIF, MYRO, SLERF, BOME
- **Base Chain:** BRETT, HIGHER, TOSHI, NORMIE
- **Ethereum:** PEPE, SHIB, FLOKI, WOJAK, TURBO
- **AI Memecoins:** Goatseus, Terminal of Truths, ZEREBRO
- **Gaming:** GALA, AXS, SAND, MANA
- **DeFi:** UNI, AAVE, COMP, MKR

## 🔧 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/yourusername/memebot.git
cd memebot

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 📈 Roadmap

- [ ] Integración con más exchanges (Binance, Coinbase)
- [ ] Trading automático real (paper trading primero)
- [ ] Análisis de sentimiento de redes sociales
- [ ] Alertas por Discord y WhatsApp
- [ ] Mobile app (React Native)
- [ ] Backtesting de estrategias

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Contacto

- **Telegram:** [@VictorLopezRapado_Alert_bot](https://t.me/VictorLopezRapado_Alert_bot)
- **Website:** [xictorlrbot.com](https://xictorlrbot.com)

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐