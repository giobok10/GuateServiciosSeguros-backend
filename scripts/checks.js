const pool = require('../src/db');

(async () => {
  try {
    const tables = ['users','categories','technicians','services','reviews'];
    for (const t of tables) {
      const r = await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
      console.log(`${t}: ${r.rows[0].c}`);
    }

    console.log('\nSample technicians:');
    const techs = await pool.query('SELECT id, user_id, description, photo_url, whatsapp FROM technicians ORDER BY id LIMIT 5');
    console.table(techs.rows);

    console.log('\nSample users:');
    const users = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id LIMIT 5');
    console.table(users.rows);

    process.exit(0);
  } catch (err) {
    console.error('DB checks failed:', err);
    process.exit(1);
  }
})();
