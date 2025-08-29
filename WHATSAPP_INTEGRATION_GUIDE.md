# 🚀 Guía de Integración de WhatsApp Business API

## 📋 Resumen del Proyecto

Este proyecto implementa una integración completa de WhatsApp Business API en la aplicación cEats, permitiendo a los restaurantes recibir pedidos directamente desde WhatsApp sin salir de la plataforma.

### 🎯 Características Implementadas

- ✅ **Doble proveedor**: Baileys (no oficial) + WhatsApp Business API (oficial)
- ✅ **Multi-tenant**: Cada restaurante/sucursal puede tener su propia integración
- ✅ **Interfaz unificada**: Todo se maneja desde la webapp sin salir de la plataforma
- ✅ **Webhooks automáticos**: Configuración automática de webhooks
- ✅ **Encriptación**: Tokens sensibles encriptados en la base de datos
- ✅ **Procesamiento de pedidos**: Conversión automática de mensajes de WhatsApp a pedidos

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   cEats WebApp   │    │   PostgreSQL    │
│   Business API  │◄──►│   (Backend)      │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Baileys       │    │   Frontend       │    │   Webhooks      │
│   (No Oficial)  │    │   (Next.js)      │    │   Processing    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Instalación y Configuración

### 1. Base de Datos

Ejecuta el script SQL para crear las tablas necesarias:

```sql
-- Ejecutar el archivo: backend/src/database/whatsapp_integrations.sql
```

### 2. Variables de Entorno

Copia el archivo `env.example` a `.env` y configura las variables:

```bash
# Configuración básica
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
ENCRYPTION_KEY=tu_clave_de_encriptacion_32_caracteres

# Facebook/WhatsApp Business API
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_APP_ACCESS_TOKEN=tu_facebook_app_access_token
FACEBOOK_CONFIG_ID=tu_facebook_config_id
```

### 3. Dependencias

Instala las dependencias necesarias:

```bash
# Backend
cd backend
npm install node-fetch crypto

# Frontend
cd actual-frontend
npm install
```

## 🔧 Configuración de WhatsApp Business API

### Paso 1: Crear App en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app
3. Agrega el producto "WhatsApp Business API"
4. Configura los permisos necesarios:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`

### Paso 2: Configurar Embedded Signup

1. En tu app de Facebook, ve a "WhatsApp > Getting Started"
2. Configura el Embedded Signup con:
   - **App ID**: Tu Facebook App ID
   - **Config ID**: Generado automáticamente
   - **Redirect URI**: `https://tu-dominio.com/api/whatsapp/oauth/callback`

### Paso 3: Configurar Webhooks

1. En "WhatsApp > Configuration"
2. Configura el webhook URL: `https://tu-dominio.com/api/whatsapp/webhook`
3. Verifica el token (se genera automáticamente)

## 🚀 Uso de la Integración

### Para Administradores

1. **Acceder a la configuración**:
   - Ve al dashboard
   - Haz clic en "Configurar WhatsApp" (solo visible para admins)

2. **Conectar WhatsApp Business API**:
   - Selecciona la sucursal
   - Haz clic en "Conectar con WhatsApp Business"
   - Se abrirá la ventana de configuración de Meta
   - Completa el proceso de autorización

3. **Conectar Baileys (opcional)**:
   - Selecciona la sucursal
   - Haz clic en "Conectar con Baileys"
   - Escanea el QR code con WhatsApp

### Para el Sistema

1. **Recepción automática de pedidos**:
   - Los webhooks reciben mensajes de WhatsApp
   - Se procesan automáticamente
   - Se convierten en pedidos del sistema

2. **Envío de mensajes**:
   - Usa la API para enviar confirmaciones
   - Envía actualizaciones de estado
   - Notifica cuando el pedido está listo

## 📊 Estructura de la Base de Datos

### Tabla: `whatsapp_integrations`

```sql
CREATE TABLE whatsapp_integrations (
    integration_id UUID PRIMARY KEY,
    restaurante_id UUID NOT NULL,
    sucursal_id UUID,
    provider VARCHAR(50) NOT NULL, -- 'baileys' o 'whatsapp_business_api'
    is_active BOOLEAN DEFAULT TRUE,
    waba_id VARCHAR(255),
    phone_number_id VARCHAR(255),
    access_token TEXT, -- Encriptado
    connection_status VARCHAR(50),
    webhook_url VARCHAR(500),
    webhook_verify_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Tabla: `whatsapp_messages`

```sql
CREATE TABLE whatsapp_messages (
    message_id UUID PRIMARY KEY,
    integration_id UUID NOT NULL,
    whatsapp_message_id VARCHAR(255) UNIQUE,
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    message_type VARCHAR(50),
    message_data JSONB,
    order_id VARCHAR(255),
    order_token VARCHAR(255),
    processing_status VARCHAR(50),
    received_at TIMESTAMP WITH TIME ZONE
);
```

## 🔌 APIs Disponibles

### Backend Endpoints

```typescript
// Obtener integraciones
GET /api/whatsapp/integrations

// Crear integración
POST /api/whatsapp/integrations

// Conectar Baileys
POST /api/whatsapp/connect/baileys

// Conectar WhatsApp Business API
POST /api/whatsapp/connect/whatsapp-business

// Webhook de WhatsApp
GET /api/whatsapp/webhook
POST /api/whatsapp/webhook

// Enviar mensaje
POST /api/whatsapp/send-message
```

### Frontend Methods

```typescript
// Cargar integraciones
apiClient.getWhatsAppIntegrations()

// Conectar Baileys
apiClient.connectBaileys(sucursalId)

// Conectar WhatsApp Business
apiClient.connectWhatsAppBusiness(sucursalId)

// Enviar mensaje
apiClient.sendWhatsAppMessage({
  sucursalId,
  toNumber,
  message,
  messageType: 'text' | 'template'
})
```

## 🔒 Seguridad

### Encriptación de Tokens

- Los access tokens se encriptan antes de guardar en la base de datos
- Se usa AES-256-CBC para la encriptación
- La clave de encriptación se almacena en variables de entorno

### Validación de Webhooks

- Se valida la firma de cada webhook recibido
- Se usa el App Secret de Facebook para la validación
- Se rechazan webhooks con firmas inválidas

### Autorización

- Solo los administradores pueden configurar WhatsApp
- Cada integración está vinculada a un restaurante específico
- Los usuarios solo pueden ver integraciones de su restaurante

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión con WhatsApp Business API**:
   - Verifica que el App ID y App Secret sean correctos
   - Asegúrate de que la app esté en modo desarrollo o producción
   - Verifica que los permisos estén configurados correctamente

2. **Webhooks no funcionan**:
   - Verifica que la URL del webhook sea accesible públicamente
   - Asegúrate de que el verify token coincida
   - Revisa los logs del servidor para errores

3. **Tokens expirados**:
   - Los tokens de acceso pueden expirar
   - Implementa renovación automática de tokens
   - Usa System User tokens para mayor estabilidad

### Logs y Debugging

```bash
# Ver logs del backend
cd backend
npm run dev

# Ver logs de webhooks
tail -f logs/webhook.log

# Verificar estado de integraciones
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/whatsapp/integrations
```

## 📈 Próximos Pasos

### Mejoras Planificadas

1. **Plantillas de mensajes**:
   - Crear y gestionar plantillas de WhatsApp
   - Envío automático de confirmaciones
   - Notificaciones de estado de pedidos

2. **Analytics**:
   - Métricas de uso de WhatsApp
   - Estadísticas de pedidos por canal
   - Reportes de rendimiento

3. **Integración con Baileys**:
   - Implementar conexión real con Baileys
   - Generación de QR codes dinámicos
   - Manejo de sesiones de Baileys

4. **Automatización**:
   - Respuestas automáticas
   - Flujos de conversación
   - Integración con chatbots

### Consideraciones de Producción

1. **Escalabilidad**:
   - Usar Redis para cache de sesiones
   - Implementar rate limiting
   - Optimizar consultas de base de datos

2. **Monitoreo**:
   - Logs estructurados
   - Métricas de rendimiento
   - Alertas automáticas

3. **Backup y Recuperación**:
   - Backup automático de integraciones
   - Recuperación de tokens
   - Migración de datos

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Agrega tests
5. Envía un pull request

## 📞 Soporte

Para soporte técnico:

- **Issues**: Usa el sistema de issues de GitHub
- **Documentación**: Revisa esta guía y los comentarios en el código
- **Comunidad**: Únete a nuestro canal de Discord

---

**Nota**: Esta integración está diseñada para ser escalable y mantenible. Sigue las mejores prácticas de seguridad y siempre prueba en un entorno de desarrollo antes de desplegar a producción.
