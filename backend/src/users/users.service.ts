import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  // Inyectamos nuestro Pool de MySQL en lugar de Prisma
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(createUserDto: CreateUserDto) {
    const { negocio_id, nombre, email, password_hash, rol_id } = createUserDto;
    
    // Obtenemos una conexión dedicada del pool para manejar la transacción
    const conn = await this.pool.getConnection();
    
    try {
      await conn.beginTransaction();

      // 1. Crear el usuario
      const [resultUser] = await conn.query<ResultSetHeader>(
        'INSERT INTO usuarios (negocio_id, nombre, email, password_hash) VALUES (?, ?, ?, ?)',
        [negocio_id, nombre, email, password_hash]
      );
      const nuevoUsuarioId = resultUser.insertId;

      // 2. Asignarle el rol
      await conn.query(
        'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)',
        [nuevoUsuarioId, rol_id]
      );

      await conn.commit();
      
      return { id: nuevoUsuarioId, nombre, email, negocio_id };
    } catch (error) {
      await conn.rollback();
      throw new InternalServerErrorException('Error al crear usuario y asignar rol', error);
    } finally {
      // Siempre liberamos la conexión al pool
      conn.release();
    }
  }

  async findAll() {
    // Consulta simple (sin transacción)
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.activo, r.nombre as rol
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id`
    );
    return rows;
  }

  // MÉTODO NUEVO PARA EL RBAC (Paso 3 del prompt)
  async obtenerPermisosDeUsuario(usuarioId: number): Promise<string[]> {
    const query = `
      SELECT p.codigo 
      FROM usuarios u
      JOIN usuario_roles ur ON u.id = ur.usuario_id
      JOIN rol_permisos rp ON ur.rol_id = rp.rol_id
      JOIN permisos p ON rp.permiso_id = p.id
      WHERE u.id = ? AND u.activo = TRUE
    `;
    
    const [rows] = await this.pool.query<RowDataPacket[]>(query, [usuarioId]);
    
    // Mapeamos los resultados (ej: [{codigo: 'ventas.crear'}, ...]) a un array simple (['ventas.crear', ...])
    return rows.map(row => row.codigo);
  }

  async updatePassword(id: number, newPasswordHash: string) {
    await this.pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
    return { message: 'Contraseña actualizada' };
  }

  async update(id: number, updateUserDto: any) {
    const { nombre, email, rol_id } = updateUserDto;
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      if (nombre || email) {
        let updateQuery = 'UPDATE usuarios SET ';
        const params = [];
        if (nombre) { updateQuery += 'nombre = ?, '; params.push(nombre); }
        if (email) { updateQuery += 'email = ?, '; params.push(email); }
        updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
        params.push(id);
        await conn.query(updateQuery, params);
      }

      if (rol_id) {
        await conn.query('UPDATE usuario_roles SET rol_id = ? WHERE usuario_id = ?', [rol_id, id]);
      }

      await conn.commit();
      return { message: 'Usuario actualizado con éxito' };
    } catch (error) {
      await conn.rollback();
      throw new InternalServerErrorException('Error al actualizar usuario', error);
    } finally {
      conn.release();
    }
  }

  async updateStatus(id: number, activo: boolean) {
    await this.pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]);
    return { message: `Usuario ${activo ? 'activado' : 'desactivado'}` };
  }

  async getUserActivity(id: number) {
    // Obtenemos info del usuario
    const [users] = await this.pool.query<RowDataPacket[]>('SELECT nombre, email FROM usuarios WHERE id = ?', [id]);
    if (users.length === 0) return null;

    // Facturas emitidas por el usuario
    const [invoices] = await this.pool.query<RowDataPacket[]>(
      `SELECT id, invoiceNumber, date, total, paymentMethod 
       FROM invoices 
       WHERE id IN (SELECT invoiceId FROM journal_entries WHERE userId = ?)
       ORDER BY date DESC LIMIT 50`,
      [id]
    );

    // Si queremos obtener sesiones de caja:
    const [sessions] = await this.pool.query<RowDataPacket[]>(
      `SELECT status, openedAt, closedAt, initialBalance, finalBalance 
       FROM cash_register_sessions 
       WHERE userId = ? 
       ORDER BY openedAt DESC LIMIT 10`,
      [id]
    );

    return {
      user: users[0],
      invoices,
      sessions
    };
  }

  async obtenerUsuarioPorEmail(email: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT u.id, u.negocio_id, u.nombre, u.email, u.password_hash, r.nombre as rol
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id
       WHERE u.email = ? AND u.activo = TRUE LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }
}
