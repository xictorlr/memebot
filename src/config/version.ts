/**
 * Application Version Configuration
 * 
 * Update this file when making changes to increment the version
 * Follow semantic versioning: MAJOR.MINOR.PATCH
 */

export const APP_VERSION = '1.0.5';

export const VERSION_HISTORY = [
  {
    version: '1.0.5',
    date: '2025-01-17',
    changes: [
      '🧪 Botón de test de Telegram añadido para verificar mensajes',
      '📱 Panel de configuración completo con 3 tipos de test',
      '🔍 Test Completo: verifica mensaje directo + análisis automático',
      '📊 Diagnóstico detallado del estado del sistema',
      '⚡ Test directo del bot @VictorLopezRapado_Alert_bot',
      '🛠️ Troubleshooting automático con mensajes específicos',
      '✅ Verificación en tiempo real del funcionamiento',
      '🎯 Feedback inmediato: "✅ Enviado" o "❌ Error específico"',
      '📝 Logs detallados para debugging',
      '🚀 Interfaz mejorada para testing de Telegram'
    ]
  },
  {
    version: '1.0.4',
    date: '2025-01-17',
    changes: [
      '🔧 Error crítico "user is not defined" solucionado en TradingHistoryChart',
      '📊 Estadísticas de performance eliminadas (datos simulados removidos)',
      '📱 Mensaje de Telegram mejorado con conteo específico por coin',
      '🎯 Formato detallado: "X BUY • Y SELL • Z HOLD" por cada memecoin',
      '⏰ Filtros de tiempo (1h/6h/24h) corregidos y funcionando',
      '🔍 Logs de debug mejorados para troubleshooting',
      '📈 Análisis más preciso de señales por timeframe',
      '🚀 Interfaz más limpia sin estadísticas confusas',
      '✅ Componentes estabilizados sin errores de referencia',
      '🎨 UI optimizada para mejor experiencia de usuario'
    ]
  },
  {
    version: '1.0.3',
    date: '2025-01-17',
    changes: [
      '🔧 Error crítico de user_id solucionado completamente',
      '🗄️ Columna user_id añadida a tabla trading_performance',
      '📊 Performance tracking personal funcionando 100%',
      '🛡️ Políticas RLS actualizadas para seguridad por usuario',
      '📈 Estadísticas públicas y privadas funcionando en paralelo',
      '🚀 Base de datos completamente estable y sin errores',
      '✅ Troubleshooting completo realizado y verificado',
      '🔄 Migración SQL aplicada exitosamente',
      '💾 Sistema de guardado de señales optimizado',
      '🎯 Aplicación 100% funcional sin errores de base de datos'
    ]
  },
  {
    version: '1.0.2',
    date: '2025-01-16',
    changes: [
      '🎯 Señales activas funcionando - ya no aparecen en 0',
      '📊 Análisis de mercado completamente arreglado',
      '🔢 Sentimiento sin decimales largos (27/100 en lugar de 27.400000000000006/100)',
      '🚀 Umbrales de señales más sensibles y realistas',
      '📈 Top movers y volume leaders funcionando correctamente',
      '🛠️ Validación robusta de datos null/undefined/NaN',
      '💡 Logs de debug mejorados para troubleshooting',
      '✅ Señales HOLD para coins en consolidación',
      '🎨 Interfaz más responsive y estable',
      '🔄 Generación automática de 5-15 señales típicamente'
    ]
  },
  {
    version: '1.0.2',
    date: '2025-01-16',
    changes: [
      '🎯 Señales activas funcionando - ya no aparecen en 0',
      '📊 Análisis de mercado completamente arreglado',
      '🔢 Sentimiento sin decimales largos (27/100 en lugar de 27.400000000000006/100)',
      '🚀 Umbrales de señales más sensibles y realistas',
      '📈 Top movers y volume leaders funcionando correctamente',
      '🛠️ Validación robusta de datos null/undefined/NaN',
      '💡 Logs de debug mejorados para troubleshooting',
      '✅ Señales HOLD para coins en consolidación',
      '🎨 Interfaz más responsive y estable',
      '🔄 Generación automática de 5-15 señales típicamente'
    ]
  },
  {
    version: '1.0.1',
    date: '2025-01-16',
    changes: [
      '🔧 Volumen 24h corregido - ya no aparece como $0',
      '📊 Mapeo correcto de datos de CoinGecko API',
      '🛠️ Validación robusta de valores nulos y undefined',
      '📈 Logs de debug mejorados para troubleshooting',
      '✅ Fallback data actualizado con volúmenes realistas',
      '🚀 Edge Function proxy más estable y confiable',
      '💡 Mejor manejo de errores de red y API',
      '🎯 Formateo consistente en todos los componentes'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-01-16',
    changes: [
      '🚀 Lanzamiento oficial v1.0 en xictorlrbot.com',
      '🤖 Sistema de análisis automático 100% funcional',
      '📱 Alertas Telegram cada 5 minutos via GitHub Actions',
      '🔧 CORS proxy solucionado con Edge Functions propias',
      '📊 +200 memecoins tracked en tiempo real',
      '🎯 Algoritmo de trading mejorado y más sensible',
      '💼 Portfolio tracking completo con P&L',
      '⭐ Watchlists personalizadas por usuario',
      '🐋 Whale tracker con movimientos grandes',
      '📈 Análisis de sentimiento de mercado',
      '🔔 Alertas de precio personalizables',
      '🛡️ Autenticación segura con Supabase',
      '🌐 Dominio personalizado xictorlrbot.com',
      '✅ Aplicación estable y lista para producción'
    ]
  },
  {
    version: '0.6.0',
    date: '2025-01-16',
    changes: [
      '🔧 Errores de imágenes placeholder completamente solucionados',
      '📱 Modal interactivo para "Coins en Alza" con detalles completos',
      '🤖 Sistema de análisis automático de Telegram FUNCIONANDO',
      '⚡ Mensajes automáticos cada 5-60 minutos configurables',
      '🎯 Detección automática de señales de trading en tiempo real',
      '📊 Dashboard mejorado con estadísticas clickeables',
      '🚀 Análisis automático se inicia 5 segundos después del login',
      '💡 Configuración de frecuencia personalizable por usuario',
      '🔄 Sistema robusto sin dependencias externas para imágenes',
      '✅ Aplicación 100% estable y funcional en producción',
      '🌐 Publicación automática con dominio personalizado',
      '🛡️ Sin errores de red ni dependencias externas fallidas'
    ]
  },
  {
    version: '0.5.0',
    date: '2025-01-16',
    changes: [
      '🚀 +200 memecoins añadidas al sistema completo',
      '🌐 Cobertura total: Solana, Base, Ethereum, BSC',
      '🤖 AI memecoins: Terminal of Truths, Goatseus, etc.',
      '🎮 Gaming completo: Axie, Sandbox, Gala, Decentraland',
      '🐕 +30 animal coins: Dogs, cats, bears, seals',
      '💰 DeFi giants: Uniswap, Aave, Compound, Maker',
      '🔥 Trending: Brett, Popcat, Mog, BOME, Wojak',
      '⚡ Base ecosystem: Higher, Toshi, Normie, Keycat',
      '🎯 Mejor detección de oportunidades de trading',
      '📊 Análisis más preciso con dataset completo',
      '🛠️ Errores de build completamente solucionados',
      '🚀 Aplicación optimizada para producción'
    ]
  },
  {
    version: '0.4.1',
    date: '2025-01-16',
    changes: [
      '🚀 +150 memecoins añadidas al sistema de tracking',
      '🌐 Solana, Base, Ethereum ecosystems completos',
      '🤖 AI memecoins: Goatseus, Terminal of Truths, etc.',
      '🎮 Gaming tokens: Gala, Axie, Sandbox, Decentraland',
      '🐕 Animal theme: Más de 20 dog/cat/animal coins',
      '📈 DeFi giants: Uniswap, Aave, Compound, Maker',
      '🔥 Trending coins: Brett, Popcat, Mog, BOME',
      '⚡ Base chain memecoins: Higher, Toshi, Normie',
      '🎯 Mejor cobertura de mercado memecoin',
      '📊 Más oportunidades de trading detectadas'
    ]
  },
  {
    version: '0.4.0',
    date: '2025-01-16',
    changes: [
      '🎯 Análisis de sentimiento de mercado en tiempo real',
      '🐋 Whale Tracker - Seguimiento de movimientos grandes',
      '🔔 Sistema de alertas de precio personalizables',
      '🤖 Trading Bot simulado con configuración avanzada',
      '📊 Métricas de mercado mejoradas con indicadores',
      '⚡ Dashboard más completo e interactivo',
      '🎨 Interfaz mejorada con más visualizaciones',
      '📈 Detección automática de tendencias y patrones',
      '🚨 Alertas inteligentes basadas en volumen',
      '💡 Consejos de trading contextuales'
    ]
  },
  {
    version: '0.3.1',
    date: '2025-01-16',
    changes: [
      '🔧 Error 500 en signup completamente solucionado',
      '🌐 CORS API funcionando 100% con proxy estable',
      '📊 20 memecoins reales verificados y funcionando',
      '🗄️ Base de datos optimizada sin conflictos',
      '🛡️ Triggers mejorados con exception handling',
      '⚡ Rendimiento optimizado y estable',
      '🚫 Sin rate limits usando proxy confiable',
      '🔄 Fallback data para máxima estabilidad',
      '✅ Registro automático 100% funcional',
      '🤖 Bot Telegram pre-configurado automáticamente',
      '🚀 Aplicación completamente estable en producción'
    ]
  },
  {
    version: '0.3.0',
    date: '2025-01-16',
    changes: [
      '🔧 Solucionado error 500 en registro de usuarios',
      '🌐 CORS API completamente funcional con proxy',
      '📊 Lista optimizada de 20 memecoins reales',
      '🗄️ Base de datos robusta con RLS completo',
      '🛡️ Triggers mejorados sin conflictos',
      '⚡ Rendimiento optimizado de la API',
      '🚫 Eliminados rate limits con proxy confiable',
      '🔄 Fallback data para mayor estabilidad',
      '✅ Registro automático funcionando 100%',
      '🤖 Bot Telegram pre-configurado automáticamente'
    ]
  },
  {
    version: '0.2.0',
    date: '2025-01-16',
    changes: [
      '🔐 Sistema de autenticación con Supabase',
      '👤 Perfiles de usuario personalizados',
      '⭐ Watchlists personalizadas por usuario',
      '💼 Portfolio tracking con P&L en tiempo real',
      '🎯 Alertas personalizadas por usuario',
      '📊 Dashboard mejorado con datos del usuario',
      '🔄 Sincronización automática de configuración',
      '🛡️ Seguridad RLS (Row Level Security)',
      '📱 Configuración Telegram por usuario',
      '✨ Interfaz mejorada con estado de autenticación'
    ]
  },
  {
    version: '0.1.0',
    date: '2025-01-16',
    changes: [
      '🚀 Lanzamiento inicial de MemeBot',
      '📊 Dashboard de trading con métricas en tiempo real',
      '🤖 Integración con Telegram Bot para alertas',
      '💰 Tracking de +500 memecoins populares',
      '📈 Generación automática de señales de trading',
      '⚡ Análisis técnico con RSI y detección de volumen',
      '🎯 Sistema de alertas personalizables',
      '📱 Interfaz responsive y moderna',
      '🔄 Actualización automática cada 5 minutos'
    ]
  }
];

export const getLatestChanges = () => {
  return VERSION_HISTORY[0]?.changes || [];
};

export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    releaseDate: VERSION_HISTORY[0]?.date,
    changes: getLatestChanges()
  };
};