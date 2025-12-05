const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// --- Helpers ---
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// --- Controlador de Registro ---
const register = async (req, res) => {
  // 1. Validar entradas
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  let { name, email, password, role } = req.body;

  // Normalizar rol a minúsculas y mapear desde frontend
  role = role ? role.toLowerCase().replace('technician', 'tech') : 'user';

  try {
    // 2. Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // 3. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Guardar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    // Si el usuario es técnico, crear un registro de técnico asociado con valores por defecto
    if (role === 'tech') {
      try {
        // category_id por defecto = 1 (la primera categoría); whatsapp vacío por ahora
        await pool.query(
          'INSERT INTO technicians (user_id, category_id, description, photo_url, whatsapp) VALUES ($1, $2, $3, $4, $5)',
          [newUser.rows[0].id, 1, '', '', '']
        );
      } catch (err) {
        console.warn('No se pudo crear perfil técnico por defecto:', err);
        // No bloqueamos el registro si falla la creación del perfil técnico
      }
    }

    // 5. Responder con el usuario creado (sin la contraseña)
    res.status(201).json(newUser.rows[0]);

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- Controlador de Login ---
const login = async (req, res) => {
  // 1. Validar entradas
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const { email, password } = req.body;

  try {
    // 2. Buscar al usuario por su email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Usuario no encontrado
    }
    const user = userResult.rows[0];

    // 3. Comparar la contraseña proporcionada con la hasheada
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Contraseña incorrecta
    }

    // 4. Crear el payload del JWT
    const payload = {
      userId: user.id,
      name: user.name,
      role: user.role,
    };

    // 5. Firmar el token JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    
    // 6. Enviar el token y datos del usuario como respuesta
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'tech' ? 'TECHNICIAN' : 'USER', // Mapear a mayúsculas para frontend
      },
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  register,
  login,
};
