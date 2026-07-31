const mysql = require('mysql2/promise');

async function fixRoles() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '598495Bar.',
    database: 'contaboost'
  });

  try {
    // 1. Asignar todos los permisos al rol 1 (Administrador)
    await pool.query('DELETE FROM rol_permisos WHERE rol_id = 1');
    const [permisos] = await pool.query('SELECT id FROM permisos');
    for (const permiso of permisos) {
      await pool.query('INSERT INTO rol_permisos (rol_id, permiso_id) VALUES (?, ?)', [1, permiso.id]);
    }
    console.log('Permisos asignados al Administrador (rol 1)');

    // 2. Asignar permisos básicos al rol 2 (Vendedor)
    await pool.query('DELETE FROM rol_permisos WHERE rol_id = 2');
    const codigosVendedor = [
      'dashboard.ver', 
      'ventas.crear', 
      'ventas.consultar_precio', 
      'caja.cerrar', 
      'ventas.ver_propias', 
      'contactos.ver'
    ];
    for (const codigo of codigosVendedor) {
      const [rows] = await pool.query('SELECT id FROM permisos WHERE codigo = ?', [codigo]);
      if (rows.length > 0) {
        await pool.query('INSERT INTO rol_permisos (rol_id, permiso_id) VALUES (?, ?)', [2, rows[0].id]);
      }
    }
    console.log('Permisos asignados al Vendedor (rol 2)');

    // 3. Crear usuario vendedor
    const [vendedorExist] = await pool.query('SELECT id FROM usuarios WHERE email = ?', ['vendedor@ejemplo.com']);
    let vendedorId;
    if (vendedorExist.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO usuarios (negocio_id, nombre, email, password_hash, activo) VALUES (?, ?, ?, ?, ?)',
        [1, 'Vendedor Prueba', 'vendedor@ejemplo.com', '123456', 1]
      );
      vendedorId = result.insertId;
      console.log('Usuario Vendedor creado');
    } else {
      vendedorId = vendedorExist[0].id;
      console.log('Usuario Vendedor ya existía');
    }

    // Asegurarse de que el vendedor tenga el rol 2
    await pool.query('DELETE FROM usuario_roles WHERE usuario_id = ?', [vendedorId]);
    await pool.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)', [vendedorId, 2]);
    console.log('Rol asignado al Vendedor');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixRoles();
