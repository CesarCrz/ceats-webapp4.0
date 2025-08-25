const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { hashPassword } = require('../utils/authUtils');

// Middleware para verificar que el usuario puede gestionar el usuario objetivo
const verifyUsuarioAccess = async (req, res, next) => {
  try {
    const { usuario_id } = req.params;
    const user = req.user;

    if (!user || !user.restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Usuario no autenticado o sin restaurante asignado' 
      });
    }

    // Los administradores pueden gestionar cualquier usuario de su restaurante
    if (user.role === 'admin') {
      // Verificar que el usuario objetivo pertenece al restaurante del admin
      const usuarioCheckQuery = `
        SELECT usuario_id FROM usuarios 
        WHERE usuario_id = $1 AND restaurante_id = $2 AND is_active = true
      `;
      const usuarioCheckResult = await db.query(usuarioCheckQuery, [usuario_id, user.restaurante_id]);

      if (usuarioCheckResult.rowCount === 0) {
        return res.status(403).json({ 
          success: false, 
          error: 'Acceso denegado: Usuario no encontrado o no pertenece a su restaurante' 
        });
      }
    } else {
      // Los empleados solo pueden gestionar su propia cuenta
      if (user.usuario_id !== usuario_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'Acceso denegado: Solo puede gestionar su propia cuenta' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en verificación de acceso a usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor durante la verificación' 
    });
  }
};

// GET /api/usuarios/:restaurante_id - Obtener usuarios de un restaurante
router.get('/:restaurante_id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { restaurante_id } = req.params;
    const user = req.user;

    // Verificar que el usuario está accediendo a su propio restaurante
    if (user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Solo puede ver usuarios de su propio restaurante' 
      });
    }

    // Obtener usuarios del restaurante (excluyendo contraseñas)
    const queryText = `
      SELECT usuario_id, email, role, restaurante_id, sucursal_id, nombre, 
             apellidos, fecha_nacimiento, telefono, fecha_registro, 
             is_email_verified, is_active
      FROM usuarios 
      WHERE restaurante_id = $1 AND is_active = true
      ORDER BY nombre, apellidos
    `;
    
    const result = await db.query(queryText, [restaurante_id]);

    res.json({
      success: true,
      usuarios: result.rows
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al obtener los usuarios' 
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const {
    email,
    password,
    role,
    restaurante_id,
    sucursal_id,
    nombre,
    apellidos,
    fecha_nacimiento,
    telefono
  } = req.body;

  // Validaciones básicas
  if (!email || !password || !role || !restaurante_id || !nombre || !apellidos) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para crear el usuario' 
    });
  }

  // Validar formato de email
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Formato de email inválido' 
    });
  }

  // Validar rol
  const rolesValidos = ['admin', 'empleado', 'gerente'];
  if (!rolesValidos.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Rol inválido. Roles válidos: admin, empleado, gerente' 
    });
  }

  try {
    // Verificar que el usuario es admin del restaurante
    if (req.user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Solo puede crear usuarios en su propio restaurante' 
      });
    }

    // Verificar que el restaurante existe y está activo
    const restauranteCheckQuery = 'SELECT restaurante_id FROM restaurantes WHERE restaurante_id = $1 AND is_active = true';
    const restauranteCheckResult = await db.query(restauranteCheckQuery, [restaurante_id]);

    if (restauranteCheckResult.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Restaurante no encontrado o inactivo' 
      });
    }

    // Si se especifica una sucursal, verificar que existe y pertenece al restaurante
    if (sucursal_id) {
      const sucursalCheckQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1 AND restaurante_id = $2 AND is_active = true';
      const sucursalCheckResult = await db.query(sucursalCheckQuery, [sucursal_id, restaurante_id]);

      if (sucursalCheckResult.rowCount === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sucursal no encontrada o no pertenece al restaurante' 
        });
      }
    }

    // Verificar que el email no esté ya registrado
    const emailCheckQuery = 'SELECT email FROM usuarios WHERE email = $1';
    const emailCheckResult = await db.query(emailCheckQuery, [email]);

    if (emailCheckResult.rowCount > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Ya existe un usuario con este email' 
      });
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar el nuevo usuario
    const insertQuery = `
      INSERT INTO usuarios (
        email, password_hash, role, restaurante_id, sucursal_id,
        nombre, apellidos, fecha_nacimiento, telefono, fecha_registro,
        is_email_verified, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING usuario_id, email, role, restaurante_id, sucursal_id, 
                nombre, apellidos, fecha_nacimiento, telefono, fecha_registro, 
                is_email_verified, is_active
    `;

    const now = new Date();
    const values = [
      email,
      hashedPassword,
      role,
      restaurante_id,
      sucursal_id || null,
      nombre,
      apellidos,
      fecha_nacimiento || null,
      telefono || null,
      now,
      false, // is_email_verified inicialmente false
      true   // is_active inicialmente true
    ];

    const result = await db.query(insertQuery, values);
    const nuevoUsuario = result.rows[0];

    console.log(`Usuario "${email}" creado con éxito. ID: ${nuevoUsuario.usuario_id}`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al crear el usuario' 
    });
  }
});

// PUT /api/usuarios/:usuario_id - Actualizar usuario
router.put('/:usuario_id', verifyToken, verifyUsuarioAccess, async (req, res) => {
  const { usuario_id } = req.params;
  const {
    nombre,
    apellidos,
    fecha_nacimiento,
    telefono,
    sucursal_id
  } = req.body;

  // Validaciones básicas
  if (!nombre || !apellidos) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para actualizar el usuario' 
    });
  }

  try {
    // Si se especifica una sucursal, verificar que existe y pertenece al restaurante del usuario
    if (sucursal_id) {
      const user = req.user;
      const sucursalCheckQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1 AND restaurante_id = $2 AND is_active = true';
      const sucursalCheckResult = await db.query(sucursalCheckQuery, [sucursal_id, user.restaurante_id]);

      if (sucursalCheckResult.rowCount === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sucursal no encontrada o no pertenece al restaurante' 
        });
      }
    }

    const updateQuery = `
      UPDATE usuarios 
      SET nombre = $1, apellidos = $2, fecha_nacimiento = $3, 
          telefono = $4, sucursal_id = $5
      WHERE usuario_id = $6 AND is_active = true
      RETURNING usuario_id, email, role, restaurante_id, sucursal_id, 
                nombre, apellidos, fecha_nacimiento, telefono, fecha_registro, 
                is_email_verified, is_active
    `;

    const values = [
      nombre,
      apellidos,
      fecha_nacimiento || null,
      telefono || null,
      sucursal_id || null,
      usuario_id
    ];

    const result = await db.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado o inactivo' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al actualizar el usuario' 
    });
  }
});

// DELETE /api/usuarios/:usuario_id - Desactivar usuario (soft delete)
router.delete('/:usuario_id', verifyToken, verifyUsuarioAccess, async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Soft delete - marcar como inactivo
    const deleteQuery = `
      UPDATE usuarios 
      SET is_active = false 
      WHERE usuario_id = $1
      RETURNING usuario_id, email, nombre, apellidos
    `;

    const result = await db.query(deleteQuery, [usuario_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al desactivar el usuario' 
    });
  }
});

module.exports = router;
