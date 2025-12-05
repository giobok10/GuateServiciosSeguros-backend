const pool = require('../src/db');

(async () => {
  try {
    console.log('Cleaning database: truncating reviews, services, technicians, users...');

    // Order matters due to FKs
    await pool.query('BEGIN');
    await pool.query('TRUNCATE TABLE reviews RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE services RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE technicians RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.query('COMMIT');

    console.log('Database cleaned. You can re-run `pnpm run seed` to re-seed demo data.');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    try { await pool.query('ROLLBACK'); } catch (_) {}
    process.exit(1);
  }
})();
