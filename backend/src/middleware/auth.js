const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  // Obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Divide el "Bearer" y toma únicamente el token

  if (!token) {
    // Si no hay token denegar acceso
    return res.status(401).json({
      success: false, 
      error: 'Acceso denegado: Token no proporcionado'
    });    
  }

  // Verificar el token 
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(`Error al verificar el token JWT -- ERROR: ${err}`);
      return res.status(403).json({
        success: false, 
        error: 'Acceso denegado: Token inválido o expirado'
      }); 
    }

    // Si el token es válido, adjuntar la información del usuario decodificada
    req.user = decoded;

    // Continuar con el siguiente middleware / manejador de ruta
    next();
  });
}

// Middleware para verificar que el usuario tiene un rol específico
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Acceso denegado: Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado: Rol requerido: ${roles.join(', ')}`
      });
    }

    next();
  };
}

// Middleware para verificar que el usuario es admin
const requireAdmin = requireRole(['admin']);

// Middleware para verificar que el usuario es admin o empleado
const requireAdminOrEmpleado = requireRole(['admin', 'empleado']);

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireAdminOrEmpleado
};
