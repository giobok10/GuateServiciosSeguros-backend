const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Ruta de Registro: POST /api/v1/auth/register
router.post('/register', 
  // --- Validaciones ---
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['USER', 'TECHNICIAN', 'user', 'tech']).withMessage('El rol debe ser válido'),
  // --- Controlador ---
  register
);

// Ruta de Login: POST /api/v1/auth/login
router.post('/login',
  // --- Validaciones ---
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  // --- Controlador ---
  login
);

module.exports = router;
