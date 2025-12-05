const pool = require('../db');

// --- Controlador para listar y filtrar técnicos ---
const getTechnicians = async (req, res) => {
  const { category, q } = req.query;
  let query = `
    SELECT 
      t.id, t.user_id, t.description, t.photo_url, t.whatsapp,
      u.name, 
      c.name AS category,
      COALESCE(AVG(r.rating), 0)::numeric(10,1) AS rating,
      COUNT(r.id)::int AS review_count
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN reviews r ON t.id = r.technician_id
  `;
  const queryParams = [];
  const conditions = [];

  if (category && category !== 'Todas') {
    conditions.push(`c.name ILIKE $${queryParams.length + 1}`);
    queryParams.push(`%${category}%`);
  }

  if (q) {
    // necesitamos dos placeholders distintos: uno para u.name y otro para t.description
    const idx1 = queryParams.length + 1;
    const idx2 = queryParams.length + 2;
    conditions.push(`(u.name ILIKE $${idx1} OR t.description ILIKE $${idx2})`);
    queryParams.push(`%${q}%`, `%${q}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += ` GROUP BY t.id, u.id, c.id ORDER BY t.created_at DESC`;

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener técnicos.' });
  }
};

// --- Controlador para obtener el detalle de un técnico ---
const getTechnicianById = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener información del técnico, sus servicios y sus reseñas
    const technicianQuery = `
      SELECT 
        t.id, t.user_id, t.description, t.photo_url, t.whatsapp,
        u.name, 
        c.name AS category,
        COALESCE(AVG(r.rating), 0)::numeric(10,1) AS rating,
        COUNT(r.id)::int AS review_count
      FROM technicians t
      JOIN users u ON t.user_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.technician_id
      WHERE t.id = $1
      GROUP BY t.id, u.id, c.id;
    `;
    const servicesQuery = `
      SELECT id, title, description, price FROM services WHERE technician_id = $1;
    `;
    const reviewsQuery = `
      SELECT 
        r.id, r.user_id, r.rating, r.comment, r.created_at,
        u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.technician_id = $1
      ORDER BY r.created_at DESC;
    `;

    const technicianResult = await pool.query(technicianQuery, [id]);
    if (technicianResult.rows.length === 0) {
      return res.status(404).json({ message: 'Técnico no encontrado.' });
    }
    const technician = technicianResult.rows[0];

    const servicesResult = await pool.query(servicesQuery, [id]);
    technician.services = servicesResult.rows;

    const reviewsResult = await pool.query(reviewsQuery, [id]);
    technician.reviews = reviewsResult.rows;

    res.json(technician);

  } catch (error) {
    console.error(`Error al obtener técnico con ID ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el técnico.' });
  }
};

// --- Controlador para obtener el perfil del técnico actual (autenticado) ---
const getMyProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const techQuery = `
      SELECT t.id, t.user_id, t.description, t.photo_url, t.whatsapp,
             u.name, c.name AS category,
             COALESCE(AVG(r.rating), 0)::numeric(10,1) AS rating,
             COUNT(r.id)::int AS review_count
      FROM technicians t
      JOIN users u ON t.user_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.technician_id
      WHERE t.user_id = $1
      GROUP BY t.id, u.id, c.id;
    `;
      let techResult = await pool.query(techQuery, [userId]);
      // Si no existe perfil, crear un perfil técnico por defecto (idempotente)
      if (techResult.rows.length === 0) {
        try {
          await pool.query('INSERT INTO technicians (user_id, category_id, description, photo_url, whatsapp) VALUES ($1, $2, $3, $4, $5)', [userId, 1, '', '', '']);
        } catch (err) {
          console.warn('No se pudo crear perfil técnico por defecto en getMyProfile:', err);
          // Si la creación falla (por ejemplo, el user_id no existe), responder 404
          return res.status(404).json({ message: 'Perfil de técnico no encontrado.' });
        }
        techResult = await pool.query(techQuery, [userId]);
        if (techResult.rows.length === 0) {
          return res.status(404).json({ message: 'Perfil de técnico no encontrado.' });
        }
      }
      const tech = techResult.rows[0];
      if (!tech) {
        return res.status(404).json({ message: 'Perfil de técnico no encontrado.' });
      }

    const servicesResult = await pool.query('SELECT id, title, description, price FROM services WHERE technician_id = $1', [tech.id]);
    tech.services = servicesResult.rows;

    const reviewsResult = await pool.query(
      `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.technician_id = $1 ORDER BY r.created_at DESC`,
      [tech.id]
    );
    tech.reviews = reviewsResult.rows;

    res.json(tech);
  } catch (error) {
    console.error('Error al obtener perfil técnico:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getTechnicians,
  getTechnicianById,
  getMyProfile
};
