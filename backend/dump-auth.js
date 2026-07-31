const mysql = require('mysql2/promise');

async function dump() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '598495Bar.',
    database: 'contaboost'
  });

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    console.log('USUARIOS:', usuarios);

    const [roles] = await pool.query('SELECT * FROM roles');
    console.log('ROLES:', roles);

    const [usuario_roles] = await pool.query('SELECT * FROM usuario_roles');
    console.log('USUARIO_ROLES:', usuario_roles);

    const [permisos_admin] = await pool.query(`
      SELECT p.codigo 
      FROM usuarios u
      JOIN usuario_roles ur ON u.id = ur.usuario_id
      JOIN rol_permisos rp ON ur.rol_id = rp.rol_id
      JOIN permisos p ON rp.permiso_id = p.id
      WHERE u.id = 100
    `);
    console.log('PERMISOS DEL USUARIO 100:', permisos_admin.map(p => p.codigo));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
dump();
