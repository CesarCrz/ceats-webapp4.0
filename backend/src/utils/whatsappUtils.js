const crypto = require('crypto');
const fetch = require('node-fetch');
const db = require('../db');

class WhatsAppUtils {
    constructor() {
        this.FACEBOOK_API_VERSION = 'v20.0';
        this.FACEBOOK_GRAPH_URL = 'https://graph.facebook.com';
    }

    // Encriptar datos sensibles
    encryptData(data, secretKey = process.env.ENCRYPTION_KEY) {
        if (!data) return null;
        const cipher = crypto.createCipher('aes-256-cbc', secretKey);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    // Desencriptar datos sensibles
    decryptData(encryptedData, secretKey = process.env.ENCRYPTION_KEY) {
        if (!encryptedData) return null;
        const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    // Generar verify token único
    generateVerifyToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Generar webhook secret
    generateWebhookSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Validar firma del webhook de WhatsApp
    validateWebhookSignature(payload, signature, appSecret) {
        const expectedSignature = crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');
        
        return `sha256=${expectedSignature}` === signature;
    }

    // Canjear código de autorización por access token
    async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/oauth/access_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    redirect_uri: redirectUri
                })
            });

            if (!response.ok) {
                throw new Error(`Error exchanging code: ${response.statusText}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    }

    // Obtener información del WABA usando Debug Token
    async getWABAInfo(accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/debug_token?input_token=${accessToken}&access_token=${process.env.FACEBOOK_APP_ACCESS_TOKEN}`);
            
            if (!response.ok) {
                throw new Error(`Error getting WABA info: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error getting WABA info:', error);
            throw error;
        }
    }

    // Obtener números de teléfono del WABA
    async getPhoneNumbers(wabaId, accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/${wabaId}/phone_numbers?access_token=${accessToken}`);
            
            if (!response.ok) {
                throw new Error(`Error getting phone numbers: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error getting phone numbers:', error);
            throw error;
        }
    }

    // Suscribir la app al WABA
    async subscribeAppToWABA(wabaId, accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/${wabaId}/subscribed_apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken
                })
            });

            if (!response.ok) {
                throw new Error(`Error subscribing app to WABA: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error subscribing app to WABA:', error);
            throw error;
        }
    }

    // Configurar webhook para el WABA
    async configureWebhook(wabaId, webhookUrl, verifyToken, accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/${wabaId}/subscribed_apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    callback_url: webhookUrl,
                    verify_token: verifyToken,
                    fields: ['messages', 'message_template_status_update', 'phone_numbers']
                })
            });

            if (!response.ok) {
                throw new Error(`Error configuring webhook: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error configuring webhook:', error);
            throw error;
        }
    }

    // Enviar mensaje de texto
    async sendTextMessage(phoneNumberId, toNumber, message, accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/${phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: toNumber,
                    type: 'text',
                    text: {
                        body: message
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Error sending message: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending text message:', error);
            throw error;
        }
    }

    // Enviar mensaje usando plantilla
    async sendTemplateMessage(phoneNumberId, toNumber, templateName, language, variables, accessToken) {
        try {
            const response = await fetch(`${this.FACEBOOK_GRAPH_URL}/${this.FACEBOOK_API_VERSION}/${phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: toNumber,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: language
                        },
                        components: variables
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Error sending template message: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending template message:', error);
            throw error;
        }
    }

    // Procesar mensaje de pedido de WhatsApp
    async processOrderMessage(messageData, integrationId) {
        try {
            const orderMessage = messageData.entry[0].changes[0].value.messages[0];
            
            if (orderMessage.type !== 'order') {
                return null;
            }

            const orderDetails = orderMessage.order;
            const orderId = orderDetails.order_id;
            const orderToken = orderDetails.token;

            // Guardar mensaje en la base de datos
            const messageQuery = `
                INSERT INTO whatsapp_messages (
                    integration_id, whatsapp_message_id, from_number, to_number,
                    message_type, message_data, order_id, order_token, processing_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING message_id
            `;

            const messageValues = [
                integrationId,
                orderMessage.id,
                orderMessage.from,
                orderMessage.to,
                'order',
                JSON.stringify(messageData),
                orderId,
                orderToken,
                'processing'
            ];

            const messageResult = await db.query(messageQuery, messageValues);
            const messageId = messageResult.rows[0].message_id;

            // Procesar los productos del pedido
            const products = orderDetails.products.map(product => ({
                name: product.name,
                quantity: product.quantity,
                price: product.price / 1000, // WhatsApp usa centavos
                currency: product.currency
            }));

            // Crear objeto de pedido compatible con el sistema actual
            const order = {
                orderId: orderId,
                orderToken: orderToken,
                name: orderMessage.from.replace('@s.whatsapp.net', ''),
                numero: orderMessage.from.replace('@s.whatsapp.net', ''),
                productDetails: JSON.stringify(products),
                total: orderDetails.price.total / 1000,
                currency: orderDetails.price.currency,
                deliverOrRest: 'recoger', // Por defecto, se puede cambiar después
                estado: 'Pendiente',
                specs: '',
                deliverTo: orderMessage.from.replace('@s.whatsapp.net', ''),
                address: null,
                referencia: null,
                payMethod: null
            };

            // Actualizar estado del mensaje
            await db.query(
                'UPDATE whatsapp_messages SET processing_status = $1, processed_at = CURRENT_TIMESTAMP WHERE message_id = $2',
                ['completed', messageId]
            );

            return order;
        } catch (error) {
            console.error('Error processing order message:', error);
            throw error;
        }
    }

    // Obtener integración de WhatsApp por restaurante/sucursal
    async getWhatsAppIntegration(restauranteId, sucursalId = null, provider = null) {
        try {
            let query = `
                SELECT * FROM whatsapp_integrations 
                WHERE restaurante_id = $1 AND is_active = true
            `;
            let values = [restauranteId];

            if (sucursalId) {
                query += ' AND sucursal_id = $2';
                values.push(sucursalId);
            }

            if (provider) {
                query += ` AND provider = $${values.length + 1}`;
                values.push(provider);
            }

            const result = await db.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting WhatsApp integration:', error);
            throw error;
        }
    }

    // Crear o actualizar integración de WhatsApp
    async upsertWhatsAppIntegration(integrationData) {
        try {
            const {
                restauranteId,
                sucursalId,
                provider,
                wabaId,
                phoneNumberId,
                businessId,
                accessToken,
                systemUserToken,
                webhookUrl,
                webhookVerifyToken,
                webhookSecret
            } = integrationData;

            // Encriptar tokens sensibles
            const encryptedAccessToken = accessToken ? this.encryptData(accessToken) : null;
            const encryptedSystemUserToken = systemUserToken ? this.encryptData(systemUserToken) : null;

            const query = `
                INSERT INTO whatsapp_integrations (
                    restaurante_id, sucursal_id, provider, waba_id, phone_number_id,
                    business_id, access_token, system_user_token, webhook_url,
                    webhook_verify_token, webhook_secret, connection_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (restaurante_id, provider) 
                DO UPDATE SET
                    sucursal_id = EXCLUDED.sucursal_id,
                    waba_id = EXCLUDED.waba_id,
                    phone_number_id = EXCLUDED.phone_number_id,
                    business_id = EXCLUDED.business_id,
                    access_token = EXCLUDED.access_token,
                    system_user_token = EXCLUDED.system_user_token,
                    webhook_url = EXCLUDED.webhook_url,
                    webhook_verify_token = EXCLUDED.webhook_verify_token,
                    webhook_secret = EXCLUDED.webhook_secret,
                    connection_status = 'disconnected',
                    updated_at = CURRENT_TIMESTAMP
                RETURNING integration_id
            `;

            const values = [
                restauranteId,
                sucursalId,
                provider,
                wabaId,
                phoneNumberId,
                businessId,
                encryptedAccessToken,
                encryptedSystemUserToken,
                webhookUrl,
                webhookVerifyToken,
                webhookSecret,
                'disconnected'
            ];

            const result = await db.query(query, values);
            return result.rows[0].integration_id;
        } catch (error) {
            console.error('Error upserting WhatsApp integration:', error);
            throw error;
        }
    }

    // Actualizar estado de conexión
    async updateConnectionStatus(integrationId, status, errorMessage = null) {
        try {
            const query = `
                UPDATE whatsapp_integrations 
                SET connection_status = $1, 
                    last_connection_attempt = CURRENT_TIMESTAMP,
                    error_message = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE integration_id = $3
            `;

            await db.query(query, [status, errorMessage, integrationId]);
        } catch (error) {
            console.error('Error updating connection status:', error);
            throw error;
        }
    }

    // Intercambiar código por access token (para Embedded Signup)
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.FACEBOOK_APP_ID,
                    client_secret: process.env.FACEBOOK_APP_SECRET,
                    redirect_uri: `${process.env.BASE_URL}/api/whatsapp/embedded-signup/callback`,
                    code: code
                })
            });

            if (!response.ok) {
                throw new Error(`Error exchanging code for token: ${response.status}`);
            }

            const data = await response.json();
            
            // Obtener información del WhatsApp Business Account
            const wabaResponse = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${data.access_token}`);
            const wabaData = await wabaResponse.json();
            
            // Obtener Phone Number ID
            const phoneResponse = await fetch(`https://graph.facebook.com/v20.0/${wabaData.id}/phone_numbers?access_token=${data.access_token}`);
            const phoneData = await phoneResponse.json();
            
            return {
                access_token: data.access_token,
                phone_number_id: phoneData.data[0]?.id,
                waba_id: wabaData.id
            };
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    }

    // Crear integración en la base de datos
    async createIntegration(integrationData) {
        try {
            const query = `
                INSERT INTO whatsapp_integrations (
                    restaurante_id, sucursal_id, provider, phone_number_id,
                    access_token_encrypted, verify_token, is_active
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            
            const values = [
                integrationData.restaurante_id,
                integrationData.sucursal_id,
                integrationData.provider,
                integrationData.phone_number_id,
                integrationData.access_token_encrypted,
                integrationData.verify_token,
                integrationData.is_active
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating integration:', error);
            throw error;
        }
    }

    // Configurar webhook automáticamente
    async configureWebhook(wabaId, webhookUrl, verifyToken, accessToken) {
        try {
            const response = await fetch(`https://graph.facebook.com/v20.0/${wabaId}/subscribed_apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    access_token: accessToken
                })
            });

            if (!response.ok) {
                throw new Error(`Error suscribiendo app al WABA: ${response.statusText}`);
            }

            // Configurar el webhook
            const webhookResponse = await fetch(`https://graph.facebook.com/v20.0/${wabaId}/webhooks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    object: 'whatsapp_business_account',
                    callback_url: webhookUrl,
                    verify_token: verifyToken,
                    fields: ['messages', 'message_deliveries', 'message_reads']
                })
            });

            if (!webhookResponse.ok) {
                throw new Error(`Error configurando webhook: ${webhookResponse.statusText}`);
            }

            console.log('Webhook configurado exitosamente');
            return true;
        } catch (error) {
            console.error('Error configuring webhook:', error);
            throw error;
        }
    }
}

module.exports = new WhatsAppUtils();
