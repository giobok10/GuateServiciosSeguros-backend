const express = require('express');
const { getTechnicians, getTechnicianById, getMyProfile } = require('../controllers/technicians.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const serviceRoutes = require('./services.routes');

const router = express.Router();

// Ruta para obtener el perfil del técnico actual (autenticado): GET /api/v1/technicians/me
router.get('/me', authMiddleware, getMyProfile);

// Ruta para listar y filtrar técnicos: GET /api/v1/technicians?category=...&q=...
router.get('/', getTechnicians);

// Ruta para obtener el detalle de un técnico: GET /api/v1/technicians/:id
router.get('/:id', getTechnicianById);

// Rutas para los servicios de un técnico
router.use('/:technicianId/services', serviceRoutes);

module.exports = router;
