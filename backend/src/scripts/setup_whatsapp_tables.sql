-- Script para configurar las tablas de WhatsApp Business API
-- Ejecutar este script en tu base de datos PostgreSQL

-- 1. Crear tabla de integraciones de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(restaurante_id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(sucursal_id) ON DELETE CASCADE,
    
    -- Configuración del proveedor
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('whatsapp_business_api')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuración para WhatsApp Business API
    waba_id VARCHAR(255), -- WhatsApp Business Account ID
    phone_number_id VARCHAR(255), -- Phone Number ID
    business_id VARCHAR(255), -- Business Manager ID
    access_token_encrypted TEXT, -- Token encriptado
    webhook_url VARCHAR(500), -- URL del webhook
    verify_token VARCHAR(255), -- Token de verificación
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES whatsapp_integrations(integration_id) ON DELETE CASCADE,
    
    -- Datos del mensaje
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- text, image, document, etc.
    message_text TEXT,
    message_data JSONB, -- Datos adicionales del mensaje
    
    -- Estado del procesamiento
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de plantillas de mensajes
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES whatsapp_integrations(integration_id) ON DELETE CASCADE,
    
    -- Configuración de la plantilla
    template_name VARCHAR(255) NOT NULL,
    template_language VARCHAR(10) DEFAULT 'es',
    template_category VARCHAR(100), -- marketing, utility, etc.
    template_content TEXT NOT NULL,
    template_variables JSONB, -- Variables disponibles en la plantilla
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_restaurante ON whatsapp_integrations(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_sucursal ON whatsapp_integrations(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_active ON whatsapp_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_integration ON whatsapp_messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_processed ON whatsapp_messages(is_processed);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_integration ON whatsapp_message_templates(integration_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_active ON whatsapp_message_templates(is_active);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear triggers para actualizar updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at 
    BEFORE UPDATE ON whatsapp_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_messages_updated_at 
    BEFORE UPDATE ON whatsapp_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_message_templates_updated_at 
    BEFORE UPDATE ON whatsapp_message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Crear función para encriptar tokens (requiere extensión pgcrypto)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para encriptar tokens (ejemplo básico)
CREATE OR REPLACE FUNCTION encrypt_access_token(token TEXT, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- En producción, usa una implementación más segura
    RETURN encode(encrypt(token::bytea, secret_key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Función para desencriptar tokens
CREATE OR REPLACE FUNCTION decrypt_access_token(encrypted_token TEXT, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- En producción, usa una implementación más segura
    RETURN convert_from(decrypt(decode(encrypted_token, 'base64'), secret_key::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;

-- 8. Insertar datos de ejemplo (opcional)
-- INSERT INTO whatsapp_integrations (restaurante_id, provider, phone_number_id, verify_token) 
-- VALUES (
--     (SELECT restaurante_id FROM restaurantes LIMIT 1),
--     'whatsapp_business_api',
--     '123456789012345',
--     'mi_token_secreto_123'
-- );

-- 9. Crear vista para facilitar consultas
CREATE OR REPLACE VIEW whatsapp_integrations_view AS
SELECT 
    wi.*,
    r.nombre as restaurante_nombre,
    s.nombre_sucursal,
    COUNT(wm.message_id) as total_messages,
    COUNT(CASE WHEN wm.is_processed = TRUE THEN 1 END) as processed_messages
FROM whatsapp_integrations wi
LEFT JOIN restaurantes r ON wi.restaurante_id = r.restaurante_id
LEFT JOIN sucursales s ON wi.sucursal_id = s.sucursal_id
LEFT JOIN whatsapp_messages wm ON wi.integration_id = wm.integration_id
GROUP BY wi.integration_id, r.nombre, s.nombre_sucursal;

-- 10. Comentarios para documentación
COMMENT ON TABLE whatsapp_integrations IS 'Tabla para almacenar las integraciones de WhatsApp Business API por restaurante/sucursal';
COMMENT ON TABLE whatsapp_messages IS 'Tabla para almacenar todos los mensajes recibidos de WhatsApp';
COMMENT ON TABLE whatsapp_message_templates IS 'Tabla para almacenar plantillas de mensajes de WhatsApp';
COMMENT ON VIEW whatsapp_integrations_view IS 'Vista para consultar integraciones con información adicional';

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('whatsapp_integrations', 'whatsapp_messages', 'whatsapp_message_templates')
ORDER BY table_name, ordinal_position;
