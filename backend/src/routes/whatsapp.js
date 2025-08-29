const express = require('express');
const router = express.Router();
const db = require('../db');
const whatsappUtils = require('../utils/whatsappUtils');
const { verifyToken } = require('../middleware/auth');

// Middleware para verificar que el usuario tiene permisos para WhatsApp
const verifyWhatsAppAccess = async (req, res, next) => {
    try {
        const user = req.user;
        
        // Solo admins pueden configurar WhatsApp
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden configurar WhatsApp'
            });
        }

        next();
    } catch (error) {
        console.error('Error verifying WhatsApp access:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// GET /api/whatsapp/integrations - Obtener integraciones de WhatsApp del restaurante
router.get('/integrations', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        
        const query = `
            SELECT 
                wi.integration_id,
                wi.provider,
                wi.is_active,
                wi.connection_status,
                wi.waba_id,
                wi.phone_number_id,
                wi.last_connection_attempt,
                wi.last_webhook_received,
                wi.error_message,
                wi.created_at,
                wi.updated_at,
                s.nombre_sucursal
            FROM whatsapp_integrations wi
            LEFT JOIN sucursales s ON wi.sucursal_id = s.sucursal_id
            WHERE wi.restaurante_id = $1
            ORDER BY wi.created_at DESC
        `;

        const result = await db.query(query, [user.restaurante_id]);
        
        res.json({
            success: true,
            integrations: result.rows
        });
    } catch (error) {
        console.error('Error getting WhatsApp integrations:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/whatsapp/integrations - Crear nueva integración de WhatsApp
router.post('/integrations', verifyToken, verifyWhatsAppAccess, async (req, res) => {
    try {
        const user = req.user;
        const {
            sucursalId,
            provider,
            wabaId,
            phoneNumberId,
            businessId,
            accessToken,
            systemUserToken
        } = req.body;

        // Validar datos requeridos
        if (!provider || !['baileys', 'whatsapp_business_api'].includes(provider)) {
            return res.status(400).json({
                success: false,
                error: 'Proveedor inválido. Debe ser "baileys" o "whatsapp_business_api"'
            });
        }

        if (provider === 'whatsapp_business_api' && (!wabaId || !phoneNumberId || !accessToken)) {
            return res.status(400).json({
                success: false,
                error: 'Para WhatsApp Business API se requiere wabaId, phoneNumberId y accessToken'
            });
        }

        // Generar tokens para webhook
        const webhookVerifyToken = whatsappUtils.generateVerifyToken();
        const webhookSecret = whatsappUtils.generateWebhookSecret();
        const webhookUrl = `${process.env.BASE_URL}/api/whatsapp/webhook`;

        // Crear la integración
        const integrationId = await whatsappUtils.upsertWhatsAppIntegration({
            restauranteId: user.restaurante_id,
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
        });

        // Si es WhatsApp Business API, configurar webhook automáticamente
        if (provider === 'whatsapp_business_api') {
            try {
                await whatsappUtils.subscribeAppToWABA(wabaId, accessToken);
                await whatsappUtils.configureWebhook(wabaId, webhookUrl, webhookVerifyToken, accessToken);
                await whatsappUtils.updateConnectionStatus(integrationId, 'connected');
            } catch (webhookError) {
                console.error('Error configuring webhook:', webhookError);
                await whatsappUtils.updateConnectionStatus(integrationId, 'error', webhookError.message);
            }
        }

        res.status(201).json({
            success: true,
            integrationId,
            message: 'Integración de WhatsApp creada exitosamente'
        });
    } catch (error) {
        console.error('Error creating WhatsApp integration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/whatsapp/integrations/:integrationId - Actualizar integración
router.put('/integrations/:integrationId', verifyToken, verifyWhatsAppAccess, async (req, res) => {
    try {
        const { integrationId } = req.params;
        const user = req.user;
        const updateData = req.body;

        // Verificar que la integración pertenece al restaurante del usuario
        const checkQuery = `
            SELECT integration_id FROM whatsapp_integrations 
            WHERE integration_id = $1 AND restaurante_id = $2
        `;
        const checkResult = await db.query(checkQuery, [integrationId, user.restaurante_id]);
        
        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Integración no encontrada'
            });
        }

        // Construir query de actualización dinámicamente
        const allowedFields = ['is_active', 'connection_status', 'error_message'];
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No hay campos válidos para actualizar'
            });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(integrationId);

        const query = `
            UPDATE whatsapp_integrations 
            SET ${updateFields.join(', ')}
            WHERE integration_id = $${paramCount}
            RETURNING integration_id
        `;

        const result = await db.query(query, values);

        res.json({
            success: true,
            message: 'Integración actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error updating WhatsApp integration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/whatsapp/integrations/:integrationId - Eliminar integración
router.delete('/integrations/:integrationId', verifyToken, verifyWhatsAppAccess, async (req, res) => {
    try {
        const { integrationId } = req.params;
        const user = req.user;

        // Verificar que la integración pertenece al restaurante del usuario
        const checkQuery = `
            SELECT integration_id FROM whatsapp_integrations 
            WHERE integration_id = $1 AND restaurante_id = $2
        `;
        const checkResult = await db.query(checkQuery, [integrationId, user.restaurante_id]);
        
        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Integración no encontrada'
            });
        }

        // Eliminar la integración
        const deleteQuery = `
            DELETE FROM whatsapp_integrations 
            WHERE integration_id = $1
        `;
        await db.query(deleteQuery, [integrationId]);

        res.json({
            success: true,
            message: 'Integración eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting WhatsApp integration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/whatsapp/connect/baileys - Iniciar conexión con Baileys
router.post('/connect/baileys', verifyToken, verifyWhatsAppAccess, async (req, res) => {
    try {
        const user = req.user;
        const { sucursalId } = req.body;

        // Verificar si ya existe una integración de Baileys
        const existingIntegration = await whatsappUtils.getWhatsAppIntegration(
            user.restaurante_id, 
            sucursalId, 
            'baileys'
        );

        if (existingIntegration) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe una integración de Baileys para este restaurante/sucursal'
            });
        }

        // Generar QR code (esto se manejará en el frontend)
        const qrCode = 'QR_CODE_PLACEHOLDER'; // Esto se generará dinámicamente

        // Crear integración de Baileys
        const integrationId = await whatsappUtils.upsertWhatsAppIntegration({
            restauranteId: user.restaurante_id,
            sucursalId,
            provider: 'baileys',
            qrCode
        });

        res.json({
            success: true,
            integrationId,
            qrCode,
            message: 'Integración de Baileys creada. Escanea el QR code para conectar.'
        });
    } catch (error) {
        console.error('Error creating Baileys integration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/whatsapp/connect/whatsapp-business - Iniciar proceso de conexión con WhatsApp Business API
router.post('/connect/whatsapp-business', verifyToken, verifyWhatsAppAccess, async (req, res) => {
    try {
        const user = req.user;
        const { sucursalId } = req.body;

        // Verificar si ya existe una integración de WhatsApp Business API
        const existingIntegration = await whatsappUtils.getWhatsAppIntegration(
            user.restaurante_id, 
            sucursalId, 
            'whatsapp_business_api'
        );

        if (existingIntegration) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe una integración de WhatsApp Business API para este restaurante/sucursal'
            });
        }

        // Generar tokens para webhook
        const webhookVerifyToken = whatsappUtils.generateVerifyToken();
        const webhookSecret = whatsappUtils.generateWebhookSecret();
        const webhookUrl = `${process.env.BASE_URL}/api/whatsapp/webhook`;

        // Crear integración temporal
        const integrationId = await whatsappUtils.upsertWhatsAppIntegration({
            restauranteId: user.restaurante_id,
            sucursalId,
            provider: 'whatsapp_business_api',
            webhookUrl,
            webhookVerifyToken,
            webhookSecret
        });

        // Configuración para Embedded Signup
        const embeddedSignupConfig = {
            appId: process.env.FACEBOOK_APP_ID,
            configId: process.env.FACEBOOK_CONFIG_ID,
            redirectUri: `${process.env.BASE_URL}/api/whatsapp/oauth/callback`,
            state: integrationId, // Usar integrationId como state
            responseType: 'code',
            scope: 'whatsapp_business_management'
        };

        res.json({
            success: true,
            integrationId,
            embeddedSignupConfig,
            message: 'Proceso de conexión iniciado. Usa la configuración para Embedded Signup.'
        });
    } catch (error) {
        console.error('Error creating WhatsApp Business API integration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/whatsapp/oauth/callback - Callback para OAuth de WhatsApp Business API
router.get('/oauth/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        
        if (!code || !state) {
            return res.status(400).json({
                success: false,
                error: 'Código de autorización o state faltante'
            });
        }

        // Obtener la integración usando el state
        const integrationQuery = `
            SELECT * FROM whatsapp_integrations 
            WHERE integration_id = $1 AND provider = 'whatsapp_business_api'
        `;
        const integrationResult = await db.query(integrationQuery, [state]);
        
        if (integrationResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Integración no encontrada'
            });
        }

        const integration = integrationResult.rows[0];

        // Canjear código por access token
        const accessToken = await whatsappUtils.exchangeCodeForToken(
            code,
            process.env.FACEBOOK_APP_ID,
            process.env.FACEBOOK_APP_SECRET,
            `${process.env.BASE_URL}/api/whatsapp/oauth/callback`
        );

        // Obtener información del WABA
        const wabaInfo = await whatsappUtils.getWABAInfo(accessToken);
        const wabaId = wabaInfo.business_id;

        // Obtener números de teléfono
        const phoneNumbers = await whatsappUtils.getPhoneNumbers(wabaId, accessToken);
        const phoneNumberId = phoneNumbers[0]?.id; // Usar el primer número disponible

        // Actualizar la integración con los datos obtenidos
        const updateQuery = `
            UPDATE whatsapp_integrations 
            SET waba_id = $1, phone_number_id = $2, access_token = $3, connection_status = 'connected'
            WHERE integration_id = $4
        `;
        
        const encryptedAccessToken = whatsappUtils.encryptData(accessToken);
        await db.query(updateQuery, [wabaId, phoneNumberId, encryptedAccessToken, state]);

        // Configurar webhook
        try {
            await whatsappUtils.subscribeAppToWABA(wabaId, accessToken);
            await whatsappUtils.configureWebhook(
                wabaId, 
                integration.webhook_url, 
                integration.webhook_verify_token, 
                accessToken
            );
        } catch (webhookError) {
            console.error('Error configuring webhook:', webhookError);
            await whatsappUtils.updateConnectionStatus(state, 'error', webhookError.message);
        }

        // Redirigir al frontend con éxito
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?whatsapp=connected`);
    } catch (error) {
        console.error('Error in OAuth callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?whatsapp=error`);
    }
});

// GET /api/whatsapp/webhook - Verificación del webhook de WhatsApp
router.get('/webhook', (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;

    if (mode === 'subscribe' && challenge) {
        // Verificar el token
        const integrationQuery = `
            SELECT integration_id FROM whatsapp_integrations 
            WHERE webhook_verify_token = $1 AND provider = 'whatsapp_business_api'
        `;
        
        db.query(integrationQuery, [verifyToken])
            .then(result => {
                if (result.rowCount > 0) {
                    console.log('Webhook verification successful');
                    res.status(200).send(challenge);
                } else {
                    console.log('Webhook verification failed - invalid token');
                    res.status(403).send('Forbidden');
                }
            })
            .catch(error => {
                console.error('Error verifying webhook:', error);
                res.status(500).send('Internal Server Error');
            });
    } else {
        res.status(403).send('Forbidden');
    }
});

// POST /api/whatsapp/webhook - Recibir mensajes de WhatsApp
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const payload = req.body.toString();

        // Validar firma del webhook
        const isValidSignature = whatsappUtils.validateWebhookSignature(
            payload, 
            signature, 
            process.env.FACEBOOK_APP_SECRET
        );

        if (!isValidSignature) {
            console.error('Invalid webhook signature');
            return res.status(401).send('Unauthorized');
        }

        const data = JSON.parse(payload);

        // Procesar cada entrada
        for (const entry of data.entry) {
            for (const change of entry.changes) {
                if (change.value && change.value.messages) {
                    for (const message of change.value.messages) {
                        // Buscar la integración correspondiente
                        const integrationQuery = `
                            SELECT integration_id FROM whatsapp_integrations 
                            WHERE waba_id = $1 AND provider = 'whatsapp_business_api'
                        `;
                        
                        const integrationResult = await db.query(integrationQuery, [entry.id]);
                        
                        if (integrationResult.rowCount > 0) {
                            const integrationId = integrationResult.rows[0].integration_id;

                            // Procesar mensaje de pedido
                            if (message.type === 'order') {
                                const order = await whatsappUtils.processOrderMessage(data, integrationId);
                                
                                if (order) {
                                    // Emitir evento para el frontend (si usas Socket.IO)
                                    // io.emit('new_whatsapp_order', order);
                                    
                                    console.log('Nuevo pedido de WhatsApp procesado:', order.orderId);
                                }
                            }
                        }
                    }
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST /api/whatsapp/send-message - Enviar mensaje
router.post('/send-message', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        const { sucursalId, toNumber, message, messageType = 'text' } = req.body;

        // Obtener integración de WhatsApp
        const integration = await whatsappUtils.getWhatsAppIntegration(
            user.restaurante_id, 
            sucursalId, 
            'whatsapp_business_api'
        );

        if (!integration) {
            return res.status(404).json({
                success: false,
                error: 'No se encontró integración de WhatsApp Business API'
            });
        }

        if (integration.connection_status !== 'connected') {
            return res.status(400).json({
                success: false,
                error: 'La integración de WhatsApp no está conectada'
            });
        }

        // Desencriptar access token
        const accessToken = whatsappUtils.decryptData(integration.access_token);

        let result;
        if (messageType === 'text') {
            result = await whatsappUtils.sendTextMessage(
                integration.phone_number_id,
                toNumber,
                message,
                accessToken
            );
        } else if (messageType === 'template') {
            // Implementar envío de plantillas
            result = await whatsappUtils.sendTemplateMessage(
                integration.phone_number_id,
                toNumber,
                message.templateName,
                message.language || 'es',
                message.variables || [],
                accessToken
            );
        }

        res.json({
            success: true,
            messageId: result.messages?.[0]?.id,
            message: 'Mensaje enviado exitosamente'
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/whatsapp/embedded-signup/init - Iniciar proceso de Embedded Signup
router.post('/embedded-signup/init', verifyToken, async (req, res) => {
    try {
        const { sucursal_id } = req.body;
        const { restaurante_id } = req.user;
        
        // Generar estado único para el proceso
        const crypto = require('crypto');
        const state = crypto.randomBytes(32).toString('hex');
        
        // Guardar el estado en la base de datos o en memoria
        // Por simplicidad, lo guardamos en memoria (en producción usar Redis)
        if (!global.embeddedSignupStates) {
            global.embeddedSignupStates = new Map();
        }
        
        global.embeddedSignupStates.set(state, {
            restaurante_id,
            sucursal_id,
            created_at: new Date(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
        });
        
        res.json({
            success: true,
            state,
            app_id: process.env.FACEBOOK_APP_ID,
            redirect_uri: `${process.env.BASE_URL}/api/whatsapp/embedded-signup/callback`
        });
    } catch (error) {
        console.error('Error initializing embedded signup:', error);
        res.status(500).json({
            success: false,
            error: 'Error al inicializar el proceso de configuración'
        });
    }
});

// POST /api/whatsapp/embedded-signup/callback - Callback del Embedded Signup
router.post('/embedded-signup/callback', verifyToken, async (req, res) => {
    try {
        const { code, state } = req.body;
        const { restaurante_id } = req.user;
        const crypto = require('crypto');
        
        // Verificar que el estado existe y no ha expirado
        if (!global.embeddedSignupStates || !global.embeddedSignupStates.has(state)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido o expirado'
            });
        }
        
        const signupData = global.embeddedSignupStates.get(state);
        if (signupData.expires_at < new Date()) {
            global.embeddedSignupStates.delete(state);
            return res.status(400).json({
                success: false,
                error: 'Estado expirado'
            });
        }
        
        // Intercambiar el código por un access token
        const tokenResponse = await whatsappUtils.exchangeCodeForToken(code);
        
        // Crear la integración
        const integrationData = {
            restaurante_id: signupData.restaurante_id,
            sucursal_id: signupData.sucursal_id || null,
            provider: 'whatsapp_business_api',
            phone_number_id: tokenResponse.phone_number_id,
            access_token_encrypted: whatsappUtils.encryptData(tokenResponse.access_token),
            verify_token: crypto.randomBytes(32).toString('hex'),
            is_active: true
        };
        
        const result = await whatsappUtils.createIntegration(integrationData);
        
        // Configurar webhook automáticamente
        try {
            const webhookUrl = `${process.env.BASE_URL}/webhook`;
            await whatsappUtils.configureWebhook(
                tokenResponse.waba_id,
                webhookUrl,
                integrationData.verify_token,
                tokenResponse.access_token
            );
            console.log('Webhook configurado automáticamente');
        } catch (webhookError) {
            console.error('Error configurando webhook automáticamente:', webhookError);
            // No fallar la integración por error de webhook
        }
        
        // Limpiar el estado
        global.embeddedSignupStates.delete(state);
        
        res.json({
            success: true,
            message: 'WhatsApp Business API configurado exitosamente',
            integration: result
        });
    } catch (error) {
        console.error('Error in embedded signup callback:', error);
        res.status(500).json({
            success: false,
            error: 'Error al completar la configuración'
        });
    }
});

module.exports = router;
