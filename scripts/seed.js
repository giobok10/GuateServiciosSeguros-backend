const pool = require('../src/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // Check if technicians exist
    const { rows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM technicians');
    if (rows[0] && rows[0].cnt > 0) {
      console.log('Database already seeded. Exiting.');
      process.exit(0);
    }

    // Insert categories
    const categories = ['Plumbing', 'Electricidad', 'Carpintería', 'Pintura', 'Informática'];
    for (const name of categories) {
      await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
    }

    // Create users (some techs and a regular user)
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'Demo User', email: 'demo@example.com', role: 'user' },
      { name: 'Ana Tecnica', email: 'ana.tech@example.com', role: 'tech' },
      { name: 'Carlos Tec', email: 'carlos.tech@example.com', role: 'tech' }
    ];

    const userIds = [];
    for (const u of users) {
      const r = await pool.query('INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id', [u.name, u.email, passwordHash, u.role]);
      userIds.push(r.rows[0].id);
    }

    // Get categories ids
    const catRes = await pool.query('SELECT id, name FROM categories');
    const catMap = {};
    catRes.rows.forEach(r => { catMap[r.name] = r.id; });

    // Create technicians linked to userIds[1..]
    const techs = [
      { user_id: userIds[1], category: 'Plumbing', description: 'Avanzado en instalaciones', photo_url: '', whatsapp: '+50255500001' },
      { user_id: userIds[2], category: 'Electricidad', description: 'Reparaciones y medidores', photo_url: '', whatsapp: '+50255500002' }
    ];

    const techIds = [];
    for (const t of techs) {
      const r = await pool.query('INSERT INTO technicians (user_id, category_id, description, photo_url, whatsapp, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id', [t.user_id, catMap[t.category], t.description, t.photo_url, t.whatsapp]);
      techIds.push(r.rows[0].id);
    }

    // Create services
    const services = [
      { technician_id: techIds[0], title: 'Reparación de fuga', price: 30, description: 'Cambio de llave y sellado' },
      { technician_id: techIds[1], title: 'Instalación de enchufe', price: 25, description: 'Cambio y prueba' }
    ];
    for (const s of services) {
      await pool.query('INSERT INTO services (technician_id, title, price, description) VALUES ($1,$2,$3,$4)', [s.technician_id, s.title, s.price, s.description]);
    }

    // Create reviews
    const reviews = [
      { technician_id: techIds[0], user_id: userIds[0], rating: 5, comment: 'Trabajo excelente' },
      { technician_id: techIds[1], user_id: userIds[0], rating: 4, comment: 'Buen servicio' }
    ];
    for (const r of reviews) {
      await pool.query('INSERT INTO reviews (technician_id, user_id, rating, comment, created_at) VALUES ($1,$2,$3,$4,NOW())', [r.technician_id, r.user_id, r.rating, r.comment]);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
}

seed();
