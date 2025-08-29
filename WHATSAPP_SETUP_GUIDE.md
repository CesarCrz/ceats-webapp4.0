# 📱 Guía de Configuración de WhatsApp Business API

## 🎯 **Paso a Paso para Configurar WhatsApp Business API**

### **Paso 1: Crear Cuenta de Meta for Developers**
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesión con tu cuenta de Facebook
3. Haz clic en "Crear App"
4. Selecciona "Business" como tipo de aplicación
5. Completa la información básica de tu app

### **Paso 2: Configurar WhatsApp Business API**
1. En tu app, ve a "Add Product"
2. Busca y agrega "WhatsApp"
3. Configura el número de teléfono de WhatsApp Business
4. Verifica tu número de teléfono

### **Paso 3: Obtener Credenciales**
1. Ve a "WhatsApp" → "Getting Started"
2. Copia tu **Phone Number ID**
3. Ve a "System Users" → "Access Tokens"
4. Genera un token de acceso (System User Access Token)

### **Paso 4: Configurar Webhooks**
1. En "WhatsApp" → "Configuration"
2. Configura tu Webhook URL: `https://tu-dominio.com/api/whatsapp/webhook`
3. Agrega el campo `messages` en "Webhook Fields"
4. Verifica el webhook

### **Paso 5: Configurar Variables de Entorno**
```bash
# En tu archivo .env
FACEBOOK_APP_ID=tu_app_id
FACEBOOK_APP_SECRET=tu_app_secret
FACEBOOK_APP_ACCESS_TOKEN=tu_system_user_access_token
FACEBOOK_APP_VERIFY_TOKEN=tu_verify_token_personalizado
```

### **Paso 6: Probar la Integración**
1. Envía un mensaje a tu número de WhatsApp Business
2. Verifica que llegue al webhook
3. Revisa los logs del servidor

## 🔧 **Configuración del Frontend**

### **Paso 7: Configurar Facebook SDK**
1. Agrega el SDK de Facebook a tu HTML:
```html
<script async defer crossorigin="src" src="https://connect.facebook.net/en_US/sdk.js"></script>
```

2. Inicializa el SDK:
```javascript
FB.init({
  appId: 'tu_app_id',
  cookie: true,
  xfbml: true,
  version: 'v20.0'
});
```

### **Paso 8: Configurar Embedded Signup**
1. En tu app de Meta, ve a "WhatsApp" → "Embedded Signup"
2. Configura las URLs de redirección
3. Configura los permisos necesarios

## 🧪 **Pruebas de la Integración**

### **Prueba 1: Webhook Básico**
```bash
curl -X POST https://tu-dominio.com/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test_id",
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
            "text": {
              "body": "Hola, quiero hacer un pedido"
            }
          }]
        }
      }]
    }]
  }'
```

### **Prueba 2: Envío de Mensaje**
```bash
curl -X POST https://graph.facebook.com/v20.0/tu_phone_number_id/messages \
  -H "Authorization: Bearer tu_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "1234567890",
    "type": "text",
    "text": {
      "body": "¡Hola! Tu pedido ha sido recibido."
    }
  }'
```

## 🚨 **Solución de Problemas Comunes**

### **Error: "Invalid access token"**
- Verifica que el token sea válido
- Asegúrate de que el token tenga los permisos correctos
- Regenera el token si es necesario

### **Error: "Webhook verification failed"**
- Verifica que el verify_token coincida
- Asegúrate de que la URL del webhook sea accesible
- Revisa los logs del servidor

### **Error: "Phone number not verified"**
- Verifica que el número esté verificado en Meta
- Asegúrate de que el número esté activo
- Revisa la configuración de WhatsApp Business

## 📋 **Checklist de Configuración**

- [ ] Cuenta de Meta for Developers creada
- [ ] App de WhatsApp Business configurada
- [ ] Número de teléfono verificado
- [ ] Credenciales obtenidas (Phone Number ID, Access Token)
- [ ] Webhook configurado y verificado
- [ ] Variables de entorno configuradas
- [ ] Facebook SDK integrado
- [ ] Embedded Signup configurado
- [ ] Pruebas básicas realizadas
- [ ] Logs del servidor verificados

## 🔒 **Consideraciones de Seguridad**

1. **Nunca expongas tus tokens** en el frontend
2. **Usa HTTPS** en producción
3. **Valida todos los webhooks** antes de procesarlos
4. **Implementa rate limiting** para evitar spam
5. **Mantén logs** de todas las interacciones
6. **Usa variables de entorno** para credenciales sensibles

## 📞 **Soporte**

Si tienes problemas:
1. Revisa la [documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
2. Consulta los logs del servidor
3. Verifica la configuración en Meta for Developers
4. Prueba con el [WhatsApp Business API Testing Tool](https://developers.facebook.com/docs/whatsapp/testing)
