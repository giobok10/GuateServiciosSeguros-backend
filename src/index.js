// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const authRoutes = require('./routes/auth.routes');
const technicianRoutes = require('./routes/technicians.routes');
const reviewRoutes = require('./routes/reviews.routes');

const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
// Seguridad básica con Helmet
app.use(helmet());
// Configuración de CORS para permitir peticiones del frontend
app.use(cors({ origin: process.env.FRONTEND_URL }));
// Rate limiter: limita peticiones por IP para mitigar abuse/DoS
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(apiLimiter);
// Parsear body de peticiones como JSON
app.use(express.json());

// --- Rutas ---
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de GuateServiciosSeguros funcionando!');
});

// Registrar rutas de autenticación
app.use('/api/v1/auth', authRoutes);
// Registrar rutas de técnicos
app.use('/api/v1/technicians', technicianRoutes);
// Registrar rutas de reseñas
app.use('/api/v1/reviews', reviewRoutes);

// Health check para Render
app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(503).send({ status: 'error', database: 'disconnected' });
  }
});


// --- Manejo de errores y arranque del servidor ---
// Middleware para manejo de errores (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
