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

// --- Controlador para añadir una reseña ---
const addReview = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const { technicianId, rating, comment } = req.body;
  const userId = req.user.userId; // Obtenido del token JWT

  try {
    // 1. Verificar que el técnico existe
    const techExists = await pool.query('SELECT id FROM technicians WHERE id = $1', [technicianId]);
    if (techExists.rows.length === 0) {
      return res.status(404).json({ message: 'Técnico no encontrado.' });
    }

    // 2. Insertar la reseña en la base de datos
    const newReview = await pool.query(
      'INSERT INTO reviews (technician_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id, technician_id, user_id, rating, comment, created_at',
      [technicianId, userId, rating, comment]
    );

    // 3. Responder con la reseña creada
    res.status(201).json(newReview.rows[0]);

  } catch (error) {
    console.error('Error al añadir reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor al añadir reseña.' });
  }
};

module.exports = {
  addReview,
};
