const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '598495Bar.',
    database: 'contaboost',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  try {
    await pool.query('DELETE FROM cash_register_sessions');
    console.log('Cleared cash_register_sessions');

    try {
      await pool.query('ALTER TABLE cash_register_sessions ADD COLUMN emissionPointId VARCHAR(36) NOT NULL AFTER userId');
      await pool.query('ALTER TABLE cash_register_sessions ADD FOREIGN KEY (emissionPointId) REFERENCES emission_points(id)');
      console.log('Added emissionPointId to cash_register_sessions');
    } catch (e) {
      console.log('Column might already exist:', e.message);
    }

    const seedPath = path.join(__dirname, 'sql', 'seed_permisos.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(sql);
    console.log('Applied seed_permisos.sql successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrate();
