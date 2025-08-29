const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/emailUtils');

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// GET /api/sucursales/:restaurante_id - Obtener sucursales de un restaurante
router.get('/:restaurante_id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { restaurante_id } = req.params;
    
    // Verificar que el usuario sea admin del restaurante
    if (req.user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ error: 'No tienes permisos para ver sucursales de este restaurante' });
    }

    const result = await pool.query(
      `SELECT 
        sucursal_id, 
        nombre_sucursal, 
        direccion, 
        telefono_contacto, 
        email_contacto_sucursal,
        ciudad,
        estado,
        codigo_postal,
        latitud,
        longitud,
        is_verified,
        is_active,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM usuarios WHERE sucursal_id = s.sucursal_id) as usuarios_count
       FROM sucursales s 
       WHERE restaurante_id = $1 
       ORDER BY created_at DESC`,
      [restaurante_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo sucursales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/sucursales/register - Registrar nueva sucursal
router.post('/register', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;
    const { restaurante_id } = req.user;

    // Validaciones
    if (!nombre || !direccion || !telefono || !email) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar que el email no esté ya registrado
    const existingSucursal = await pool.query(
      'SELECT sucursal_id FROM sucursales WHERE email_contacto_sucursal = $1',
      [email]
    );

    if (existingSucursal.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una sucursal con este email' });
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear la sucursal
    const result = await pool.query(
      `INSERT INTO sucursales (
        sucursal_id, 
        restaurante_id, 
        nombre_sucursal, 
        direccion, 
        telefono_contacto, 
        email_contacto_sucursal, 
        ciudad,
        estado,
        codigo_postal,
        verification_code, 
        verification_code_expires_at,
        is_verified,
        is_active,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING sucursal_id, nombre_sucursal, email_contacto_sucursal`,
      [
        uuidv4(),
        restaurante_id,
        nombre,
        direccion,
        telefono,
        email,
        req.body.ciudad || null,
        req.body.estado || null,
        req.body.codigo_postal || null,
        verificationCode,
        expiresAt,
        false,
        true,
        new Date()
      ]
    );

    const sucursal = result.rows[0];

    // Enviar email de verificación
    try {
      await sendVerificationEmail(
        email,
        verificationCode,
        `Verificación de Sucursal - ${nombre}`,
        `Tu código de verificación para la sucursal "${nombre}" es: ${verificationCode}. Este código expira en 24 horas.`
      );
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      // No fallar la operación si el email falla
    }

    res.status(201).json({
      success: true,
      message: 'Sucursal registrada exitosamente. Se ha enviado un código de verificación al email proporcionado.',
      sucursal: {
        sucursal_id: sucursal.sucursal_id,
        nombre_sucursal: sucursal.nombre_sucursal,
        email_contacto_sucursal: sucursal.email_contacto_sucursal
      }
    });

  } catch (error) {
    console.error('Error registrando sucursal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/sucursales/verify - Verificar código de sucursal
router.post('/verify', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { sucursal_id, verification_code } = req.body;
    const { restaurante_id } = req.user;

    if (!sucursal_id || !verification_code) {
      return res.status(400).json({ error: 'ID de sucursal y código de verificación son requeridos' });
    }

    // Verificar que la sucursal pertenece al restaurante del usuario
    const sucursalResult = await pool.query(
      `SELECT 
        sucursal_id, 
        nombre_sucursal, 
        email_contacto_sucursal, 
        verification_code, 
        verification_code_expires_at,
        is_verified
       FROM sucursales 
       WHERE sucursal_id = $1 AND restaurante_id = $2`,
      [sucursal_id, restaurante_id]
    );

    if (sucursalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    const sucursal = sucursalResult.rows[0];

    if (sucursal.is_verified) {
      return res.status(400).json({ error: 'La sucursal ya ha sido verificada' });
    }

    if (sucursal.verification_code !== verification_code) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    if (new Date() > new Date(sucursal.verification_code_expires_at)) {
      return res.status(400).json({ error: 'El código de verificación ha expirado' });
    }

    // Marcar sucursal como verificada
    await pool.query(
      'UPDATE sucursales SET is_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE sucursal_id = $1',
      [sucursal_id]
    );

    // Crear usuario de sucursal con contraseña temporal
    const tempPassword = verification_code; // Usar el código como contraseña temporal
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (
        usuario_id,
        email,
        password_hash,
        role,
        restaurante_id,
        sucursal_id,
        nombre,
        apellidos,
        is_email_verified,
        is_first_login,
        temp_password,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING usuario_id, email, nombre, apellidos`,
      [
        uuidv4(),
        sucursal.email_contacto_sucursal,
        hashedTempPassword,
        'empleado',
        restaurante_id,
        sucursal_id,
        'Usuario',
        sucursal.nombre_sucursal,
        true,
        true,
        hashedTempPassword,
        true
      ]
    );

    const usuario = usuarioResult.rows[0];

    res.json({
      success: true,
      message: 'Sucursal verificada exitosamente. Se ha creado un usuario con acceso temporal.',
      sucursal: {
        sucursal_id: sucursal.sucursal_id,
        nombre_sucursal: sucursal.nombre_sucursal,
        email_contacto_sucursal: sucursal.email_contacto_sucursal
      },
      usuario: {
        usuario_id: usuario.usuario_id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos
      },
      tempPassword: tempPassword // Solo para mostrar al admin
    });

  } catch (error) {
    console.error('Error verificando sucursal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/sucursales/login - Login de usuario de sucursal
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const result = await pool.query(
      `SELECT 
        u.usuario_id,
        u.email,
        u.password_hash,
        u.role,
        u.restaurante_id,
        u.sucursal_id,
        u.nombre_sucursal,
        u.apellidos,
        u.is_email_verified,
        u.is_first_login,
        u.temp_password,
        u.is_active,
        s.nombre as sucursal_nombre,
        r.nombre as restaurante_nombre
       FROM usuarios u
       JOIN sucursales s ON u.sucursal_id = s.sucursal_id
       JOIN restaurantes r ON u.restaurante_id = r.restaurante_id
       WHERE u.email = $1 AND u.role = 'empleado'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    if (!user.is_email_verified) {
      return res.status(401).json({ error: 'Email no verificado' });
    }

    // Verificar contraseña (normal o temporal)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    const isValidTempPassword = user.temp_password ? await bcrypt.compare(password, user.temp_password) : false;

    if (!isValidPassword && !isValidTempPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si es primer login, requerir cambio de contraseña
    if (user.is_first_login) {
      return res.status(200).json({
        success: true,
        requiresPasswordChange: true,
        message: 'Primer login detectado. Debes cambiar tu contraseña.',
        user: {
          usuario_id: user.usuario_id,
          email: user.email,
          nombre: user.nombre_sucursal,
          apellidos: user.apellidos,
          role: user.role,
          restaurante_id: user.restaurante_id,
          sucursal_id: user.sucursal_id,
          sucursal_nombre: user.sucursal_nombre,
          restaurante_nombre: user.restaurante_nombre
        }
      });
    }

    // Login normal
    const token = jwt.sign(
      {
        usuario_id: user.usuario_id,
        email: user.email,
        role: user.role,
        restaurante_id: user.restaurante_id,
        sucursal_id: user.sucursal_id,
        nombre: user.nombre,
        apellidos: user.apellidos
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        usuario_id: user.usuario_id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        role: user.role,
        restaurante_id: user.restaurante_id,
        sucursal_id: user.sucursal_id,
        sucursal_nombre: user.sucursal_nombre,
        restaurante_nombre: user.restaurante_nombre
      }
    });

  } catch (error) {
    console.error('Error en login de sucursal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/sucursales/change-password - Cambiar contraseña de usuario de sucursal
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT usuario_id, password_hash, temp_password, is_first_login FROM usuarios WHERE email = $1 AND role = $2',
      [email, 'empleado']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Verificar contraseña actual (normal o temporal)
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
    const isValidTempPassword = user.temp_password ? await bcrypt.compare(currentPassword, user.temp_password) : false;

    if (!isValidCurrentPassword && !isValidTempPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y marcar como no primer login
    await pool.query(
      `UPDATE usuarios 
       SET password_hash = $1, temp_password = NULL, is_first_login = false 
       WHERE usuario_id = $2`,
      [hashedNewPassword, user.usuario_id]
    );

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/sucursales/:sucursal_id - Actualizar sucursal
router.put('/:sucursal_id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { sucursal_id } = req.params;
    const { nombre, direccion, telefono, email, is_active } = req.body;
    const { restaurante_id } = req.user;

    // Verificar que la sucursal pertenece al restaurante
    const existingSucursal = await pool.query(
      'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1 AND restaurante_id = $2',
      [sucursal_id, restaurante_id]
    );

    if (existingSucursal.rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    // Actualizar sucursal
    await pool.query(
      `UPDATE sucursales 
       SET nombre_sucursal = $1, direccion = $2, telefono_contacto = $3, email_contacto_sucursal = $4, 
           ciudad = $5, estado = $6, codigo_postal = $7, is_active = $8, updated_at = NOW()
       WHERE sucursal_id = $9`,
      [nombre, direccion, telefono, email, req.body.ciudad || null, req.body.estado || null, req.body.codigo_postal || null, is_active, sucursal_id]
    );

    res.json({
      success: true,
      message: 'Sucursal actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando sucursal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/sucursales/:sucursal_id - Eliminar sucursal
router.delete('/:sucursal_id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { sucursal_id } = req.params;
    const { restaurante_id } = req.user;

    // Verificar que la sucursal pertenece al restaurante
    const existingSucursal = await pool.query(
      'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1 AND restaurante_id = $2',
      [sucursal_id, restaurante_id]
    );

    if (existingSucursal.rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    // Verificar que no hay usuarios activos en la sucursal
    const usuariosResult = await pool.query(
      'SELECT COUNT(*) FROM usuarios WHERE sucursal_id = $1 AND is_active = true',
      [sucursal_id]
    );

    if (parseInt(usuariosResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la sucursal porque tiene usuarios activos. Desactiva los usuarios primero.' 
      });
    }

    // Eliminar sucursal
    await pool.query('DELETE FROM sucursales WHERE sucursal_id = $1', [sucursal_id]);

    res.json({
      success: true,
      message: 'Sucursal eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando sucursal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
