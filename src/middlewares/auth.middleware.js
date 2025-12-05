const jwt = require('jsonwebtoken');
const pool = require('../db');

const authMiddleware = async (req, res, next) => {
  // 1. Obtener el token de la cabecera de autorización
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, autorización denegada.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Adjuntar el usuario al objeto de la petición (req.user)
    // Esto permite que los controladores posteriores accedan a la información del usuario
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    res.status(401).json({ message: 'Token no válido.' });
  }
};

// Middleware para verificar el rol (ej. solo técnicos)
const authorizeRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado: rol insuficiente.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  authorizeRole
};
