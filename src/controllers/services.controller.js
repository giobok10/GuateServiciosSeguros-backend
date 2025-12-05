const { validationResult } = require('express-validator');
const pool = require('../db');

// --- Helpers ---
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// --- Controlador para añadir un servicio ---
const addService = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const { technicianId } = req.params; // Obtenido de los parámetros de la URL
  const { title, description, price } = req.body;
  const userId = req.user.userId; // ID del usuario autenticado

  try {
    // 1. Verificar que el usuario autenticado sea realmente el técnico que intenta añadir el servicio
    const techUser = await pool.query('SELECT user_id FROM technicians WHERE id = $1', [technicianId]);
    if (techUser.rows.length === 0 || techUser.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Acceso denegado: no eres el propietario de este perfil de técnico.' });
    }

    // 2. Insertar el nuevo servicio en la base de datos
    const newService = await pool.query(
      'INSERT INTO services (technician_id, title, description, price) VALUES ($1, $2, $3, $4) RETURNING id, technician_id, title, description, price',
      [technicianId, title, description, price]
    );

    // 3. Responder con el servicio creado
    res.status(201).json(newService.rows[0]);

  } catch (error) {
    console.error('Error al añadir servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor al añadir servicio.' });
  }
};

module.exports = {
  addService,
};
