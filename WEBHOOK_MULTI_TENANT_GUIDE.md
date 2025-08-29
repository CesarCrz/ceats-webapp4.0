# 🌐 Webhook Multi-Tenant para WhatsApp Business API

## 🎯 **Descripción General**

Este webhook único maneja todos los pedidos y mensajes de WhatsApp Business API para todos los clientes (restaurantes/sucursales) de la plataforma cEats. Es completamente multi-tenant y automáticamente identifica y redirige los mensajes al restaurante correcto.

## 🏗️ **Arquitectura del Webhook**

### **URL del Webhook**
```
https://tu-dominio.com/webhook
```

### **Flujo de Procesamiento**
1. **Recepción**: Meta envía todos los mensajes a esta URL única
2. **Verificación**: Se valida la firma del webhook con el App Secret
3. **Identificación**: Se identifica el tenant por `phone_number_id`
4. **Procesamiento**: Se procesa el mensaje según su tipo
5. **Almacenamiento**: Se guarda en la base de datos del tenant correcto
6. **Notificación**: Se envía confirmación al cliente

## 🔧 **Configuración del Webhook**

### **1. Variables de Entorno Requeridas**
```bash
# Meta for Developers
FACEBOOK_APP_ID=tu_app_id
FACEBOOK_APP_SECRET=tu_app_secret
FACEBOOK_APP_VERIFY_TOKEN=tu_verify_token_personalizado

# URL de la aplicación
BASE_URL=https://tu-dominio.com

# Base de datos
DB_USER=tu_usuario_db
DB_HOST=localhost
DB_DATABASE=ceats_db
DB_PASSWORD=tu_password_db
DB_PORT=5432
```

### **2. Configuración en Meta for Developers**
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Selecciona tu aplicación
3. Ve a "WhatsApp" → "Configuration"
4. Configura el webhook:
   - **Callback URL**: `https://tu-dominio.com/webhook`
   - **Verify Token**: El mismo que configuraste en `FACEBOOK_APP_VERIFY_TOKEN`
   - **Webhook Fields**: `messages`, `message_deliveries`, `message_reads`

## 📋 **Endpoints del Webhook**

### **GET /webhook - Verificación**
```http
GET /webhook?hub.mode=subscribe&hub.verify_token=TU_VERIFY_TOKEN&hub.challenge=CHALLENGE_CODE
```

**Respuesta**: Devuelve el `hub.challenge` si la verificación es exitosa.

### **POST /webhook - Recibir Mensajes**
```http
POST /webhook
Content-Type: application/json
X-Hub-Signature-256: sha256=...

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "1234567890",
                "id": "MESSAGE_ID",
                "timestamp": "1234567890",
                "type": "order",
                "order": {
                  "order_id": "ORDER_ID",
                  "token": "ORDER_TOKEN",
                  "products": [...],
                  "price": {...}
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## 🔍 **Identificación Multi-Tenant**

### **Proceso de Identificación**
1. **Extraer `phone_number_id`** del webhook
2. **Buscar en la base de datos** la integración correspondiente
3. **Identificar el restaurante/sucursal** asociado
4. **Procesar el mensaje** en el contexto correcto

### **Query de Identificación**
```sql
SELECT 
    wi.integration_id,
    wi.restaurante_id,
    wi.sucursal_id,
    wi.is_active,
    r.nombre as restaurante_nombre,
    s.nombre_sucursal
FROM whatsapp_integrations wi
LEFT JOIN restaurantes r ON wi.restaurante_id = r.restaurante_id
LEFT JOIN sucursales s ON wi.sucursal_id = s.sucursal_id
WHERE wi.phone_number_id = $1 
AND wi.provider = 'whatsapp_business_api'
AND wi.is_active = true
```

## 📦 **Procesamiento de Pedidos**

### **Estructura del Pedido de WhatsApp**
```json
{
  "type": "order",
  "order": {
    "order_id": "ORDER_ID",
    "token": "ORDER_TOKEN",
    "products": [
      {
        "name": "Hamburguesa",
        "quantity": 2,
        "price": 15000,
        "currency": "MXN",
        "product_retailer_id": "SKU_001"
      }
    ],
    "price": {
      "total": 30000,
      "currency": "MXN"
    }
  }
}
```

### **Conversión a Formato cEats**
```javascript
const orderData = {
    orderId: order.order_id,
    orderToken: order.token,
    name: message.from.replace('@s.whatsapp.net', ''),
    numero: message.from.replace('@s.whatsapp.net', ''),
    productDetails: JSON.stringify(products),
    total: order.price.total / 1000, // WhatsApp usa centavos
    currency: order.price.currency,
    deliverOrRest: 'recoger',
    estado: 'Pendiente',
    sucursal_id: tenant.sucursal_id,
    restaurante_id: tenant.restaurante_id
};
```

## 🔒 **Seguridad**

### **Verificación de Firma**
```javascript
function verifyWebhookSignature(body, signature) {
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
```

### **Validaciones Implementadas**
- ✅ **Firma del webhook**: Verificación con App Secret
- ✅ **Token de verificación**: Validación en GET /webhook
- ✅ **Identificación de tenant**: Verificación de integración activa
- ✅ **Logs de seguridad**: Registro de todas las operaciones

## 📊 **Tipos de Mensajes Soportados**

### **1. Pedidos (order)**
- Procesamiento automático de pedidos del catálogo
- Conversión a formato cEats
- Almacenamiento en base de datos
- Confirmación automática al cliente

### **2. Mensajes de Texto (text)**
- Almacenamiento para análisis
- Base para futuras implementaciones de bot
- Logs de comunicación

### **3. Imágenes (image)**
- Almacenamiento de referencias
- Procesamiento futuro si es necesario

### **4. Documentos (document)**
- Almacenamiento de referencias
- Procesamiento futuro si es necesario

## 🗄️ **Almacenamiento de Datos**

### **Tabla: whatsapp_messages**
```sql
CREATE TABLE whatsapp_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES whatsapp_integrations(integration_id),
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_text TEXT,
    message_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabla: pedidos (existente)**
Los pedidos se almacenan en la tabla `pedidos` existente con:
- Código único del pedido de WhatsApp
- Información del cliente
- Productos y precios
- Asociación con sucursal/restaurante

## 🔄 **Configuración Automática**

### **Durante el Embedded Signup**
1. **Crear integración** en la base de datos
2. **Configurar webhook automáticamente** en Meta
3. **Suscribir app al WABA**
4. **Configurar campos del webhook**

### **Código de Configuración**
```javascript
// Configurar webhook automáticamente
const webhookUrl = `${process.env.BASE_URL}/webhook`;
await whatsappUtils.configureWebhook(
    wabaId,
    webhookUrl,
    verifyToken,
    accessToken
);
```

## 📈 **Monitoreo y Logs**

### **Logs Implementados**
- ✅ Recepción de webhooks
- ✅ Verificación de firmas
- ✅ Identificación de tenants
- ✅ Procesamiento de mensajes
- ✅ Creación de pedidos
- ✅ Envío de confirmaciones
- ✅ Errores y excepciones

### **Métricas Recomendadas**
- Número de webhooks recibidos por día
- Tiempo de procesamiento promedio
- Tasa de éxito en identificación de tenants
- Número de pedidos procesados
- Errores por tipo

## 🧪 **Pruebas del Webhook**

### **1. Prueba de Verificación**
```bash
curl -X GET "https://tu-dominio.com/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=123456"
```

### **2. Prueba de Pedido**
```bash
curl -X POST "https://tu-dominio.com/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test_waba_id",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "test_phone_id"
          },
          "messages": [{
            "from": "1234567890",
            "id": "test_message_id",
            "timestamp": "1234567890",
            "type": "order",
            "order": {
              "order_id": "test_order_id",
              "token": "test_token",
              "products": [{
                "name": "Test Product",
                "quantity": 1,
                "price": 1000,
                "currency": "MXN"
              }],
              "price": {
                "total": 1000,
                "currency": "MXN"
              }
            }
          }]
        }
      }]
    }]
  }'
```

## 🚀 **Ventajas de esta Implementación**

### **Multi-Tenant**
- ✅ **Un solo webhook** para todos los clientes
- ✅ **Identificación automática** por phone_number_id
- ✅ **Aislamiento de datos** por restaurante/sucursal
- ✅ **Escalabilidad** sin límites

### **Automatización**
- ✅ **Configuración automática** durante Embedded Signup
- ✅ **Procesamiento automático** de pedidos
- ✅ **Confirmaciones automáticas** a clientes
- ✅ **Almacenamiento automático** de mensajes

### **Seguridad**
- ✅ **Verificación de firmas** con App Secret
- ✅ **Validación de tokens** de verificación
- ✅ **Logs de seguridad** completos
- ✅ **Manejo de errores** robusto

### **Flexibilidad**
- ✅ **Soporte para múltiples tipos** de mensajes
- ✅ **Extensibilidad** para futuras funcionalidades
- ✅ **Configuración por tenant** individual
- ✅ **Integración con sistema existente**

## 📞 **Soporte**

Para problemas con el webhook:
1. Revisa los logs del servidor
2. Verifica la configuración en Meta for Developers
3. Confirma que las variables de entorno estén correctas
4. Prueba la conectividad del webhook

**¡El webhook multi-tenant está listo para manejar todos los pedidos de WhatsApp Business API de todos tus clientes!**
