const pool = require('../src/db');

(async () => {
  try {
    console.log('Buscando usuarios con role=tech sin perfil en technicians...');
    const res = await pool.query(`
      SELECT u.id FROM users u
      LEFT JOIN technicians t ON t.user_id = u.id
      WHERE u.role = 'tech' AND t.id IS NULL
    `);
    if (res.rows.length === 0) {
      console.log('No hay usuarios tech sin perfil. Nada que hacer.');
      process.exit(0);
    }
    for (const row of res.rows) {
      const userId = row.id;
      try {
        await pool.query('INSERT INTO technicians (user_id, category_id, description, photo_url, whatsapp) VALUES ($1, $2, $3, $4, $5)', [userId, 1, '', '', '']);
        console.log(`Creado perfil técnico por defecto para user_id=${userId}`);
      } catch (err) {
        console.error(`Error creando perfil para user_id=${userId}:`, err.message);
      }
    }
    console.log('Backfill completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en backfill:', err);
    process.exit(1);
  }
})();
