-- Esquema para integraciones de WhatsApp Business API
-- Tabla para almacenar las configuraciones de WhatsApp por cliente

CREATE TABLE IF NOT EXISTS whatsapp_integrations (
    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(restaurante_id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(sucursal_id) ON DELETE CASCADE,
    
    -- Configuración del proveedor
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('baileys', 'whatsapp_business_api')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuración para WhatsApp Business API
    waba_id VARCHAR(255), -- WhatsApp Business Account ID
    phone_number_id VARCHAR(255), -- Phone Number ID
    business_id VARCHAR(255), -- Business Manager ID
    access_token TEXT, -- Access token (encriptado)
    system_user_token TEXT, -- Token de System User (encriptado)
    
    -- Configuración para Baileys
    baileys_session_data TEXT, -- Datos de sesión de Baileys (encriptado)
    qr_code TEXT, -- QR code para conexión
    
    -- Estado de la integración
    connection_status VARCHAR(50) DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'connecting', 'connected', 'error')),
    last_connection_attempt TIMESTAMP WITH TIME ZONE,
    last_webhook_received TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Configuración de webhook
    webhook_url VARCHAR(500),
    webhook_verify_token VARCHAR(255),
    webhook_secret VARCHAR(255),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CONSTRAINT unique_restaurante_provider UNIQUE (restaurante_id, provider),
    CONSTRAINT unique_sucursal_provider UNIQUE (sucursal_id, provider)
);

-- Tabla para almacenar mensajes y pedidos recibidos
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES whatsapp_integrations(integration_id) ON DELETE CASCADE,
    
    -- Datos del mensaje
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL, -- ID del mensaje de WhatsApp
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'text', 'order', 'image', 'document', etc.
    
    -- Contenido del mensaje
    message_text TEXT,
    message_data JSONB, -- Datos completos del mensaje en formato JSON
    
    -- Para pedidos
    order_id VARCHAR(255), -- ID del pedido si es un mensaje de tipo order
    order_token VARCHAR(255), -- Token del pedido
    
    -- Estado de procesamiento
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Metadatos
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar plantillas de mensajes
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES whatsapp_integrations(integration_id) ON DELETE CASCADE,
    
    -- Datos de la plantilla
    template_name VARCHAR(255) NOT NULL,
    template_language VARCHAR(10) NOT NULL DEFAULT 'es',
    template_category VARCHAR(100), -- 'marketing', 'utility', 'authentication'
    
    -- Contenido
    header_text TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    
    -- Variables de la plantilla
    variables JSONB, -- Array de variables disponibles
    
    -- Estado
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    whatsapp_template_id VARCHAR(255), -- ID de la plantilla en WhatsApp
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_restaurante ON whatsapp_integrations(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_sucursal ON whatsapp_integrations(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_provider ON whatsapp_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_status ON whatsapp_integrations(connection_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_integration ON whatsapp_messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_type ON whatsapp_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(processing_status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_received_at ON whatsapp_messages(received_at);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_integration ON whatsapp_message_templates(integration_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_message_templates(status);

-- Comentarios
COMMENT ON TABLE whatsapp_integrations IS 'Configuraciones de integración de WhatsApp por restaurante/sucursal';
COMMENT ON TABLE whatsapp_messages IS 'Mensajes recibidos de WhatsApp';
COMMENT ON TABLE whatsapp_message_templates IS 'Plantillas de mensajes de WhatsApp';

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at 
    BEFORE UPDATE ON whatsapp_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at 
    BEFORE UPDATE ON whatsapp_message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
