// Script de debugging para identificar el problema con user_id
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDatabase() {
  console.log('🔍 INICIANDO TROUBLESHOOTING DE BASE DE DATOS\n');
  
  // 1. Verificar estructura de todas las tablas
  console.log('1️⃣ VERIFICANDO ESTRUCTURA DE TABLAS:');
  console.log('=' .repeat(50));
  
  const tables = [
    'user_profiles',
    'watchlists', 
    'trading_rules',
    'portfolio_entries',
    'user_alerts',
    'trading_performance',
    'trading_actions'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Tabla: ${table}`);
      
      // Obtener columnas de la tabla
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', table)
        .eq('table_schema', 'public');
        
      if (columnsError) {
        console.error(`❌ Error obteniendo columnas de ${table}:`, columnsError.message);
        continue;
      }
      
      if (!columns || columns.length === 0) {
        console.log(`⚠️  Tabla ${table} no encontrada o sin columnas`);
        continue;
      }
      
      console.log(`✅ Columnas encontradas (${columns.length}):`);
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
      });
      
      // Verificar específicamente si tiene user_id
      const hasUserId = columns.some(col => col.column_name === 'user_id');
      console.log(`🔍 ¿Tiene columna user_id? ${hasUserId ? '✅ SÍ' : '❌ NO'}`);
      
    } catch (error) {
      console.error(`❌ Error procesando tabla ${table}:`, error.message);
    }
  }
  
  // 2. Verificar migraciones aplicadas
  console.log('\n\n2️⃣ VERIFICANDO MIGRACIONES:');
  console.log('=' .repeat(50));
  
  try {
    const { data: migrations, error: migrationsError } = await supabase
      .from('supabase_migrations.schema_migrations')
      .select('*')
      .order('version', { ascending: false });
      
    if (migrationsError) {
      console.error('❌ Error obteniendo migraciones:', migrationsError.message);
    } else {
      console.log(`✅ Migraciones aplicadas (${migrations?.length || 0}):`);
      migrations?.slice(0, 10).forEach(migration => {
        console.log(`   - ${migration.version} (${new Date(migration.inserted_at).toLocaleString()})`);
      });
    }
  } catch (error) {
    console.error('❌ Error verificando migraciones:', error.message);
  }
  
  // 3. Probar queries específicas que están fallando
  console.log('\n\n3️⃣ PROBANDO QUERIES PROBLEMÁTICAS:');
  console.log('=' .repeat(50));
  
  // Test 1: Query básica a trading_performance
  console.log('\n🧪 Test 1: SELECT básico de trading_performance');
  try {
    const { data, error } = await supabase
      .from('trading_performance')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error en SELECT básico:', error.message);
    } else {
      console.log('✅ SELECT básico funciona');
      console.log('📊 Columnas disponibles:', Object.keys(data?.[0] || {}));
    }
  } catch (error) {
    console.error('❌ Error en test 1:', error.message);
  }
  
  // Test 2: Query con user_id
  console.log('\n🧪 Test 2: SELECT con user_id');
  try {
    const { data, error } = await supabase
      .from('trading_performance')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error('❌ Error en SELECT con user_id:', error.message);
      console.error('❌ Código de error:', error.code);
      console.error('❌ Detalles:', error.details);
    } else {
      console.log('✅ SELECT con user_id funciona');
    }
  } catch (error) {
    console.error('❌ Error en test 2:', error.message);
  }
  
  // Test 3: INSERT con user_id
  console.log('\n🧪 Test 3: INSERT con user_id');
  try {
    const { data, error } = await supabase
      .from('trading_performance')
      .insert({
        coin_id: 'test-coin',
        symbol: 'TEST',
        buy_price: 1.0,
        buy_date: new Date().toISOString(),
        status: 'open',
        user_id: '00000000-0000-0000-0000-000000000000' // UUID de prueba
      })
      .select();
      
    if (error) {
      console.error('❌ Error en INSERT con user_id:', error.message);
      console.error('❌ Código de error:', error.code);
    } else {
      console.log('✅ INSERT con user_id funciona');
      
      // Limpiar el registro de prueba
      if (data?.[0]?.id) {
        await supabase
          .from('trading_performance')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Registro de prueba eliminado');
      }
    }
  } catch (error) {
    console.error('❌ Error en test 3:', error.message);
  }
  
  // 4. Verificar políticas RLS
  console.log('\n\n4️⃣ VERIFICANDO POLÍTICAS RLS:');
  console.log('=' .repeat(50));
  
  try {
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('schemaname, tablename, policyname, permissive, roles, cmd, qual')
      .eq('schemaname', 'public')
      .eq('tablename', 'trading_performance');
      
    if (policiesError) {
      console.error('❌ Error obteniendo políticas RLS:', policiesError.message);
    } else {
      console.log(`✅ Políticas RLS para trading_performance (${policies?.length || 0}):`);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd}) - Roles: ${policy.roles}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verificando políticas RLS:', error.message);
  }
  
  console.log('\n\n🏁 TROUBLESHOOTING COMPLETADO');
  console.log('=' .repeat(50));
  console.log('Por favor, comparte estos resultados para identificar el problema exacto.');
}

// Ejecutar debugging
debugDatabase().catch(console.error);