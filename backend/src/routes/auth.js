const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, comparePassword } = require('../utils/authUtils');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailUtils');

// Verificar código de verificación
router.post('/verify-email', async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere email y código de verificación'
    });
  }

  try {
    // Buscar usuario por email y código de verificación
    const queryText = `
      SELECT u.*, r.nombre as nombre_restaurante 
      FROM usuarios u 
      JOIN restaurantes r ON u.restaurante_id = r.restaurante_id 
      WHERE u.email = $1 AND u.verification_code = $2 AND u.is_email_verified = false
    `;
    const result = await db.query(queryText, [email, verificationCode]);

    if (result.rowCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificación inválido o email ya verificado'
      });
    }

    const user = result.rows[0];

    // Verificar si el código no ha expirado
    if (new Date() > new Date(user.verification_code_expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificación expirado'
      });
    }

    // Actualizar usuario como verificado
    const updateQuery = `
      UPDATE usuarios 
      SET is_email_verified = true, verification_code = null, verification_code_expires_at = null 
      WHERE email = $1
    `;
    await db.query(updateQuery, [email]);

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(email, user.nombre, user.nombre_restaurante);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
      // No fallar la verificación por error de email
    }

    res.json({
      success: true,
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
      user: {
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en verificación de email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la verificación'
    });
  }
});

// Reenviar código de verificación
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere email'
    });
  }

  try {
    // Buscar usuario no verificado
    const queryText = `
      SELECT * FROM usuarios 
      WHERE email = $1 AND is_email_verified = false
    `;
    const result = await db.query(queryText, [email]);

    if (result.rowCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Usuario no encontrado o ya verificado'
      });
    }

    const user = result.rows[0];

    // Generar nuevo código de verificación
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Actualizar código en la base de datos
    const updateQuery = `
      UPDATE usuarios 
      SET verification_code = $1, verification_code_expires_at = $2 
      WHERE email = $3
    `;
    await db.query(updateQuery, [newVerificationCode, newExpiration, email]);

    // Enviar nuevo email de verificación
    const emailSent = await sendVerificationEmail(email, newVerificationCode, user.nombre);

    if (emailSent) {
      res.json({
        success: true,
        message: 'Nuevo código de verificación enviado a tu email'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error enviando email de verificación'
      });
    }

  } catch (error) {
    console.error('Error reenviando verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
