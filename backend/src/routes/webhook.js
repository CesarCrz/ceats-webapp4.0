const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const whatsappUtils = require('../utils/whatsappUtils');

// GET /webhook - Verificación del webhook de Meta
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verificar que el token coincida con el configurado
    if (mode === 'subscribe' && token === process.env.FACEBOOK_APP_VERIFY_TOKEN) {
        console.log('Webhook verificado exitosamente');
        res.status(200).send(challenge);
    } else {
        console.log('Verificación del webhook fallida');
        res.sendStatus(403);
    }
});

// POST /webhook - Recibir mensajes y pedidos de WhatsApp
router.post('/', async (req, res) => {
    try {
        // 1. Verificar la firma del webhook
        const signature = req.headers['x-hub-signature-256'];
        if (!verifyWebhookSignature(req.body, signature)) {
            console.error('Firma del webhook inválida');
            return res.status(401).send('Unauthorized');
        }

        const body = req.body;
        console.log('Webhook recibido:', JSON.stringify(body, null, 2));

        // 2. Verificar que es un mensaje de WhatsApp Business
        if (body.object !== 'whatsapp_business_account') {
            return res.status(200).send('OK');
        }

        // 3. Procesar cada entrada del webhook
        for (const entry of body.entry) {
            const wabaId = entry.id; // WhatsApp Business Account ID
            const changes = entry.changes;

            for (const change of changes) {
                if (change.value && change.value.messages) {
                    const phoneNumberId = change.value.metadata.phone_number_id;
                    
                    // 4. Identificar el tenant (restaurante/sucursal) por phone_number_id
                    const tenant = await identifyTenant(phoneNumberId);
                    
                    if (!tenant) {
                        console.error(`No se encontró tenant para phone_number_id: ${phoneNumberId}`);
                        continue;
                    }

                    // 5. Procesar cada mensaje
                    for (const message of change.value.messages) {
                        await processMessage(message, tenant, wabaId, phoneNumberId);
                    }
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Función para verificar la firma del webhook
function verifyWebhookSignature(body, signature) {
    if (!signature) {
        return false;
    }

    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Función para identificar el tenant por phone_number_id
async function identifyTenant(phoneNumberId) {
    try {
        const query = `
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
        `;

        const result = await db.query(query, [phoneNumberId]);
        
        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error identificando tenant:', error);
        return null;
    }
}

// Función para procesar mensajes
async function processMessage(message, tenant, wabaId, phoneNumberId) {
    try {
        console.log(`Procesando mensaje de tipo: ${message.type} para tenant: ${tenant.restaurante_nombre}`);

        // Guardar el mensaje en la base de datos
        await saveMessage(message, tenant.integration_id, wabaId, phoneNumberId);

        // Procesar según el tipo de mensaje
        switch (message.type) {
            case 'order':
                await processOrderMessage(message, tenant);
                break;
            case 'text':
                await processTextMessage(message, tenant);
                break;
            case 'image':
                await processImageMessage(message, tenant);
                break;
            case 'document':
                await processDocumentMessage(message, tenant);
                break;
            default:
                console.log(`Tipo de mensaje no procesado: ${message.type}`);
        }
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
}

// Función para guardar mensaje en la base de datos
async function saveMessage(message, integrationId, wabaId, phoneNumberId) {
    try {
        const query = `
            INSERT INTO whatsapp_messages (
                integration_id, whatsapp_message_id, from_number, to_number,
                message_type, message_text, message_data, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `;

        const values = [
            integrationId,
            message.id,
            message.from,
            message.to || phoneNumberId,
            message.type,
            message.text?.body || null,
            JSON.stringify(message)
        ];

        await db.query(query, values);
    } catch (error) {
        console.error('Error guardando mensaje:', error);
    }
}

// Función para procesar mensajes de pedido
async function processOrderMessage(message, tenant) {
    try {
        console.log('Procesando pedido de WhatsApp:', message.order);

        const order = message.order;
        const orderId = order.order_id;
        const orderToken = order.token;

        // Extraer información del pedido
        const products = order.products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price / 1000, // WhatsApp usa centavos
            currency: product.currency,
            product_retailer_id: product.product_retailer_id
        }));

        // Crear objeto de pedido compatible con el sistema actual
        const orderData = {
            orderId: orderId,
            orderToken: orderToken,
            name: message.from.replace('@s.whatsapp.net', ''),
            numero: message.from.replace('@s.whatsapp.net', ''),
            productDetails: JSON.stringify(products),
            total: order.price.total / 1000,
            currency: order.price.currency,
            deliverOrRest: 'recoger', // Por defecto, se puede cambiar después
            estado: 'Pendiente',
            specs: '',
            deliverTo: message.from.replace('@s.whatsapp.net', ''),
            address: null,
            payMethod: null,
            sucursal_id: tenant.sucursal_id || null,
            restaurante_id: tenant.restaurante_id
        };

        // Guardar el pedido en la base de datos
        await saveOrder(orderData);

        // Enviar confirmación al cliente
        await sendOrderConfirmation(message.from, orderId, tenant);

        console.log(`Pedido ${orderId} procesado exitosamente para ${tenant.restaurante_nombre}`);
    } catch (error) {
        console.error('Error procesando pedido:', error);
    }
}

// Función para procesar mensajes de texto
async function processTextMessage(message, tenant) {
    try {
        const text = message.text.body;
        console.log(`Mensaje de texto recibido: "${text}" para ${tenant.restaurante_nombre}`);

        // Aquí puedes implementar lógica para procesar comandos de texto
        // Por ejemplo: "quiero hacer un pedido", "ver menú", etc.
        
        // Por ahora, solo guardamos el mensaje
        // En el futuro, puedes implementar un bot de WhatsApp aquí
    } catch (error) {
        console.error('Error procesando mensaje de texto:', error);
    }
}

// Función para procesar mensajes de imagen
async function processImageMessage(message, tenant) {
    try {
        console.log(`Mensaje de imagen recibido para ${tenant.restaurante_nombre}`);
        // Implementar procesamiento de imágenes si es necesario
    } catch (error) {
        console.error('Error procesando mensaje de imagen:', error);
    }
}

// Función para procesar mensajes de documento
async function processDocumentMessage(message, tenant) {
    try {
        console.log(`Mensaje de documento recibido para ${tenant.restaurante_nombre}`);
        // Implementar procesamiento de documentos si es necesario
    } catch (error) {
        console.error('Error procesando mensaje de documento:', error);
    }
}

// Función para guardar pedido en la base de datos
async function saveOrder(orderData) {
    try {
        const query = `
            INSERT INTO pedidos (
                codigo, deliver_or_rest, estado, nombre, celular, sucursal_id,
                pedido, instrucciones, entregar_a, domicilio, total, currency,
                pago, fecha, hora, tiempo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING codigo
        `;

        const values = [
            orderData.orderId,
            orderData.deliverOrRest,
            orderData.estado,
            orderData.name,
            orderData.numero,
            orderData.sucursal_id,
            orderData.productDetails,
            orderData.specs,
            orderData.deliverTo,
            orderData.address,
            orderData.total,
            orderData.currency,
            orderData.payMethod,
            new Date().toISOString().split('T')[0],
            new Date().toLocaleTimeString('es-MX', { hour12: false }),
            ''
        ];

        const result = await db.query(query, values);
        console.log(`Pedido guardado con código: ${result.rows[0].codigo}`);
        
        return result.rows[0];
    } catch (error) {
        console.error('Error guardando pedido:', error);
        throw error;
    }
}

// Función para enviar confirmación de pedido
async function sendOrderConfirmation(toNumber, orderId, tenant) {
    try {
        // Obtener la integración de WhatsApp
        const integration = await getWhatsAppIntegration(tenant.integration_id);
        
        if (!integration) {
            console.error('No se encontró integración de WhatsApp para enviar confirmación');
            return;
        }

        // Desencriptar access token
        const accessToken = whatsappUtils.decryptData(integration.access_token_encrypted);

        // Mensaje de confirmación
        const confirmationMessage = `¡Gracias por tu pedido! 🎉\n\nTu pedido #${orderId} ha sido recibido y está siendo procesado.\n\nTe notificaremos cuando esté listo.`;

        // Enviar mensaje
        await whatsappUtils.sendTextMessage(
            integration.phone_number_id,
            toNumber,
            confirmationMessage,
            accessToken
        );

        console.log(`Confirmación enviada para pedido ${orderId}`);
    } catch (error) {
        console.error('Error enviando confirmación:', error);
    }
}

// Función para obtener integración de WhatsApp
async function getWhatsAppIntegration(integrationId) {
    try {
        const query = `
            SELECT * FROM whatsapp_integrations 
            WHERE integration_id = $1
        `;

        const result = await db.query(query, [integrationId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error obteniendo integración:', error);
        return null;
    }
}

module.exports = router;
