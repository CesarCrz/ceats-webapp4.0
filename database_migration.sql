-- Migración para funcionalidad completa de sucursales
-- Ejecutar en PostgreSQL

-- Agregar campos necesarios a la tabla sucursales
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Agregar campo para contraseña temporal en usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_sucursales_restaurante_id ON sucursales(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_email ON sucursales(email);
CREATE INDEX IF NOT EXISTS idx_sucursales_verification_code ON sucursales(verification_code);
CREATE INDEX IF NOT EXISTS idx_usuarios_sucursal_id ON usuarios(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Comentarios para documentación
COMMENT ON COLUMN sucursales.email IS 'Email de contacto de la sucursal para verificación';
COMMENT ON COLUMN sucursales.verification_code IS 'Código de 6 dígitos para verificar la sucursal';
COMMENT ON COLUMN sucursales.verification_code_expires_at IS 'Fecha de expiración del código de verificación';
COMMENT ON COLUMN sucursales.is_verified IS 'Indica si la sucursal ha sido verificada por email';
COMMENT ON COLUMN sucursales.is_active IS 'Indica si la sucursal está activa';
COMMENT ON COLUMN usuarios.is_first_login IS 'Indica si es el primer login del usuario (requiere cambio de contraseña)';
COMMENT ON COLUMN usuarios.temp_password IS 'Contraseña temporal para usuarios de sucursal';
