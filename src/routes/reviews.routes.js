const express = require('express');
const { body } = require('express-validator');
const { addReview } = require('../controllers/reviews.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Ruta para crear una reseña (protegida)
router.post('/', 
  authMiddleware, // Solo usuarios autenticados pueden dejar reseñas
  body('technicianId').isInt().withMessage('ID de técnico inválido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('El rating debe ser entre 1 y 5'),
  body('comment').optional().isString().trim().escape(),
  addReview
);

module.exports = router;
