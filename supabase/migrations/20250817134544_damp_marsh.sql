-- Añadir columna user_id a trading_performance
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Añadir la columna user_id (nullable para datos existentes)
ALTER TABLE trading_performance 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_trading_performance_user_id 
ON trading_performance(user_id);

-- 3. Actualizar políticas RLS
DROP POLICY IF EXISTS "Public can read trading performance" ON trading_performance;

-- Política para usuarios autenticados (pueden ver su propia data)
CREATE POLICY "Users can read own trading performance"
ON trading_performance
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para acceso público (solo data sin user_id)
CREATE POLICY "Public can read general trading performance"
ON trading_performance
FOR SELECT
TO public
USING (user_id IS NULL);

-- Política para insertar data general (sin user_id)
CREATE POLICY "System can insert general trading performance"
ON trading_performance
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 4. Comentario para documentar
COMMENT ON COLUMN trading_performance.user_id IS 'User ID for personal tracking. NULL for general/public statistics';