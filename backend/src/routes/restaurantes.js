const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { hashPassword } = require('../utils/authUtils');

// Middleware para verificar que el usuario es admin del restaurante
const verifyRestauranteAdmin = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const user = req.user;

    if (!user || !user.restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Usuario no autenticado o sin restaurante asignado' 
      });
    }

    // Verificar que el usuario sea admin del restaurante
    if (user.role !== 'admin' || user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Solo puede gestionar su propio restaurante' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de admin de restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor durante la verificación' 
    });
  }
};

// GET /api/restaurantes - Obtener restaurantes del usuario autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Usuario sin restaurante asignado' 
      });
    }

    // Obtener el restaurante del usuario
    const queryText = `
      SELECT restaurante_id, nombre, nombre_contacto_legal, email_contacto_legal, 
             telefono_contacto_legal, direccion_fiscal, fecha_registro, is_active
      FROM restaurantes 
      WHERE restaurante_id = $1 AND is_active = true
    `;
    
    const result = await db.query(queryText, [user.restaurante_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Restaurante no encontrado' 
      });
    }

    res.json({
      success: true,
      restaurante: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al obtener el restaurante' 
    });
  }
});

// POST /api/restaurantes - Crear nuevo restaurante (solo para registro inicial)
router.post('/', async (req, res) => {
  const {
    nombre,
    nombre_contacto_legal,
    email_contacto_legal,
    telefono_contacto_legal,
    direccion_fiscal,
    rfc
  } = req.body;

  // Validaciones básicas
  if (!nombre || !nombre_contacto_legal || !email_contacto_legal || !telefono_contacto_legal || !direccion_fiscal) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para crear el restaurante' 
    });
  }

  // Validar formato de email
  if (!/\S+@\S+\.\S+/.test(email_contacto_legal)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Formato de email inválido' 
    });
  }

  let client;

  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Verificar que el email no esté ya registrado
    const emailCheckQuery = 'SELECT email_contacto_legal FROM restaurantes WHERE email_contacto_legal = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email_contacto_legal]);

    if (emailCheckResult.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        success: false, 
        error: 'Ya existe un restaurante con este email de contacto' 
      });
    }

    // Insertar el nuevo restaurante
    const insertQuery = `
      INSERT INTO restaurantes (
        nombre, nombre_contacto_legal, email_contacto_legal, 
        telefono_contacto_legal, direccion_fiscal, rfc, 
        fecha_registro, terminos_aceptados_at, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING restaurante_id, nombre, nombre_contacto_legal, email_contacto_legal, 
                telefono_contacto_legal, direccion_fiscal, fecha_registro, is_active
    `;

    const now = new Date();
    const values = [
      nombre,
      nombre_contacto_legal,
      email_contacto_legal,
      telefono_contacto_legal,
      direccion_fiscal,
      rfc || null,
      now,
      now,
      true
    ];

    const result = await client.query(insertQuery, values);
    const nuevoRestaurante = result.rows[0];

    await client.query('COMMIT');

    console.log(`Restaurante "${nombre}" creado con éxito. ID: ${nuevoRestaurante.restaurante_id}`);

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      restaurante: nuevoRestaurante
    });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error al crear restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al crear el restaurante' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// PUT /api/restaurantes/:restaurante_id - Actualizar restaurante
router.put('/:restaurante_id', verifyToken, verifyRestauranteAdmin, async (req, res) => {
  const { restaurante_id } = req.params;
  const {
    nombre,
    nombre_contacto_legal,
    telefono_contacto_legal,
    direccion_fiscal,
    rfc
  } = req.body;

  // Validaciones básicas
  if (!nombre || !nombre_contacto_legal || !telefono_contacto_legal || !direccion_fiscal) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para actualizar el restaurante' 
    });
  }

  try {
    const updateQuery = `
      UPDATE restaurantes 
      SET nombre = $1, nombre_contacto_legal = $2, telefono_contacto_legal = $3, 
          direccion_fiscal = $4, rfc = $5
      WHERE restaurante_id = $6 AND is_active = true
      RETURNING restaurante_id, nombre, nombre_contacto_legal, email_contacto_legal, 
                telefono_contacto_legal, direccion_fiscal, fecha_registro, is_active
    `;

    const values = [nombre, nombre_contacto_legal, telefono_contacto_legal, direccion_fiscal, rfc, restaurante_id];
    const result = await db.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Restaurante no encontrado o inactivo' 
      });
    }

    res.json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      restaurante: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al actualizar el restaurante' 
    });
  }
});

// DELETE /api/restaurantes/:restaurante_id - Desactivar restaurante (soft delete)
router.delete('/:restaurante_id', verifyToken, verifyRestauranteAdmin, async (req, res) => {
  const { restaurante_id } = req.params;

  try {
    // Soft delete - marcar como inactivo
    const deleteQuery = `
      UPDATE restaurantes 
      SET is_active = false 
      WHERE restaurante_id = $1
      RETURNING restaurante_id, nombre
    `;

    const result = await db.query(deleteQuery, [restaurante_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Restaurante no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Restaurante desactivado exitosamente',
      restaurante: result.rows[0]
    });

  } catch (error) {
    console.error('Error al desactivar restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al desactivar el restaurante' 
    });
  }
});

module.exports = router;
