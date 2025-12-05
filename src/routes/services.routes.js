const express = require('express');
const { body, param } = require('express-validator');
const { addService } = require('../controllers/services.controller');
const { authMiddleware, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router({ mergeParams: true }); // Para acceder a :technicianId desde rutas parent

// Ruta para que un técnico añada un servicio (protegida y con autorización de rol)
router.post('/', 
  authMiddleware, 
  authorizeRole(['tech']), // Solo técnicos pueden añadir servicios
  param('technicianId').isInt().withMessage('ID de técnico inválido'),
  body('title').notEmpty().withMessage('El título del servicio es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
  body('price').isNumeric().withMessage('El precio debe ser un número').optional(),
  addService
);

module.exports = router;
