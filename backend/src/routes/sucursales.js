const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Middleware para verificar que el usuario puede gestionar la sucursal
const verifySucursalAccess = async (req, res, next) => {
  try {
    const { sucursal_id } = req.params;
    const user = req.user;

    if (!user || !user.restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Usuario no autenticado o sin restaurante asignado' 
      });
    }

    // Los administradores pueden gestionar cualquier sucursal de su restaurante
    if (user.role === 'admin') {
      // Verificar que la sucursal pertenece al restaurante del usuario
      const sucursalCheckQuery = `
        SELECT sucursal_id FROM sucursales 
        WHERE sucursal_id = $1 AND restaurante_id = $2 AND is_active = true
      `;
      const sucursalCheckResult = await db.query(sucursalCheckQuery, [sucursal_id, user.restaurante_id]);

      if (sucursalCheckResult.rowCount === 0) {
        return res.status(403).json({ 
          success: false, 
          error: 'Acceso denegado: Sucursal no encontrada o no pertenece a su restaurante' 
        });
      }
    } else {
      // Los empleados solo pueden gestionar su sucursal asignada
      if (user.sucursal_id !== sucursal_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'Acceso denegado: Solo puede gestionar su sucursal asignada' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en verificación de acceso a sucursal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor durante la verificación' 
    });
  }
};

// GET /api/sucursales/:restaurante_id - Obtener sucursales de un restaurante
router.get('/:restaurante_id', verifyToken, async (req, res) => {
  try {
    const { restaurante_id } = req.params;
    const user = req.user;

    if (!user || !user.restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Usuario sin restaurante asignado' 
      });
    }

    // Verificar que el usuario está accediendo a su propio restaurante
    if (user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Solo puede ver sucursales de su propio restaurante' 
      });
    }

    // Obtener sucursales del restaurante
    const queryText = `
      SELECT sucursal_id, restaurante_id, nombre_sucursal, direccion, 
             telefono_contacto, email_contacto_sucursal, ciudad, estado, 
             codigo_postal, latitud, longitud, fecha_creacion, is_active
      FROM sucursales 
      WHERE restaurante_id = $1 AND is_active = true
      ORDER BY nombre_sucursal
    `;
    
    const result = await db.query(queryText, [restaurante_id]);

    res.json({
      success: true,
      sucursales: result.rows
    });

  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al obtener las sucursales' 
    });
  }
});

// POST /api/sucursales - Crear nueva sucursal
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const {
    restaurante_id,
    nombre_sucursal,
    direccion,
    telefono_contacto,
    email_contacto_sucursal,
    ciudad,
    estado,
    codigo_postal,
    latitud,
    longitud
  } = req.body;

  // Validaciones básicas
  if (!restaurante_id || !nombre_sucursal || !direccion || !telefono_contacto) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para crear la sucursal' 
    });
  }

  try {
    // Verificar que el usuario es admin del restaurante
    if (req.user.restaurante_id !== restaurante_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Solo puede crear sucursales en su propio restaurante' 
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

    // Insertar la nueva sucursal
    const insertQuery = `
      INSERT INTO sucursales (
        restaurante_id, nombre_sucursal, direccion, telefono_contacto,
        email_contacto_sucursal, ciudad, estado, codigo_postal, 
        latitud, longitud, fecha_creacion, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING sucursal_id, restaurante_id, nombre_sucursal, direccion, 
                telefono_contacto, email_contacto_sucursal, ciudad, estado, 
                codigo_postal, latitud, longitud, fecha_creacion, is_active
    `;

    const now = new Date();
    const values = [
      restaurante_id,
      nombre_sucursal,
      direccion,
      telefono_contacto,
      email_contacto_sucursal || null,
      ciudad || null,
      estado || null,
      codigo_postal || null,
      latitud || null,
      longitud || null,
      now,
      true
    ];

    const result = await db.query(insertQuery, values);
    const nuevaSucursal = result.rows[0];

    console.log(`Sucursal "${nombre_sucursal}" creada con éxito. ID: ${nuevaSucursal.sucursal_id}`);

    res.status(201).json({
      success: true,
      message: 'Sucursal creada exitosamente',
      sucursal: nuevaSucursal
    });

  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al crear la sucursal' 
    });
  }
});

// PUT /api/sucursales/:sucursal_id - Actualizar sucursal
router.put('/:sucursal_id', verifyToken, verifySucursalAccess, async (req, res) => {
  const { sucursal_id } = req.params;
  const {
    nombre_sucursal,
    direccion,
    telefono_contacto,
    email_contacto_sucursal,
    ciudad,
    estado,
    codigo_postal,
    latitud,
    longitud
  } = req.body;

  // Validaciones básicas
  if (!nombre_sucursal || !direccion || !telefono_contacto) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltan datos requeridos para actualizar la sucursal' 
    });
  }

  try {
    const updateQuery = `
      UPDATE sucursales 
      SET nombre_sucursal = $1, direccion = $2, telefono_contacto = $3,
          email_contacto_sucursal = $4, ciudad = $5, estado = $6,
          codigo_postal = $7, latitud = $8, longitud = $9
      WHERE sucursal_id = $10 AND is_active = true
      RETURNING sucursal_id, restaurante_id, nombre_sucursal, direccion, 
                telefono_contacto, email_contacto_sucursal, ciudad, estado, 
                codigo_postal, latitud, longitud, fecha_creacion, is_active
    `;

    const values = [
      nombre_sucursal,
      direccion,
      telefono_contacto,
      email_contacto_sucursal || null,
      ciudad || null,
      estado || null,
      codigo_postal || null,
      latitud || null,
      longitud || null,
      sucursal_id
    ];

    const result = await db.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sucursal no encontrada o inactiva' 
      });
    }

    res.json({
      success: true,
      message: 'Sucursal actualizada exitosamente',
      sucursal: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al actualizar la sucursal' 
    });
  }
});

// DELETE /api/sucursales/:sucursal_id - Desactivar sucursal (soft delete)
router.delete('/:sucursal_id', verifyToken, verifySucursalAccess, async (req, res) => {
  const { sucursal_id } = req.params;

  try {
    // Soft delete - marcar como inactiva
    const deleteQuery = `
      UPDATE sucursales 
      SET is_active = false 
      WHERE sucursal_id = $1
      RETURNING sucursal_id, nombre_sucursal
    `;

    const result = await db.query(deleteQuery, [sucursal_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sucursal no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Sucursal desactivada exitosamente',
      sucursal: result.rows[0]
    });

  } catch (error) {
    console.error('Error al desactivar sucursal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al desactivar la sucursal' 
    });
  }
});

module.exports = router;
