const bcrypt = require('bcrypt');
const { PostgresPoolWrapper } = require('./dist/database/database.wrapper');

async function run() {
  const hash = await bcrypt.hash('ContaBoost2026', 10);
  const wrapper = new PostgresPoolWrapper('postgresql://neondb_owner:npg_lCmeJM5jPs7u@ep-late-wind-ayrskl71-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  const conn = await wrapper.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query('INSERT INTO usuarios (negocio_id, nombre, email, password_hash) VALUES (?, ?, ?, ?)', [1, 'Jorge Admin', 'jorge@contaboost.com', hash]);
    
    // Using the wrapper, it returns [{ insertId }]
    const userId = res.insertId;
    
    await conn.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)', [userId, 1]);
    await conn.commit();
    console.log('Created user with ID', userId);
  } catch (err) {
    await conn.rollback();
    console.error(err);
  } finally {
    conn.release();
  }
}

run();
