"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(createUserDto) {
        const { negocio_id, nombre, email, password_hash, rol_id } = createUserDto;
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            const [resultUser] = await conn.query('INSERT INTO usuarios (negocio_id, nombre, email, password_hash) VALUES (?, ?, ?, ?)', [negocio_id, nombre, email, password_hash]);
            const nuevoUsuarioId = resultUser.insertId;
            await conn.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)', [nuevoUsuarioId, rol_id]);
            await conn.commit();
            return { id: nuevoUsuarioId, nombre, email, negocio_id };
        }
        catch (error) {
            await conn.rollback();
            throw new common_1.InternalServerErrorException('Error al crear usuario y asignar rol', error);
        }
        finally {
            conn.release();
        }
    }
    async findAll() {
        const [rows] = await this.pool.query(`SELECT u.id, u.nombre, u.email, u.activo, r.nombre as rol
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id`);
        return rows;
    }
    async obtenerPermisosDeUsuario(usuarioId) {
        const query = `
      SELECT p.codigo 
      FROM usuarios u
      JOIN usuario_roles ur ON u.id = ur.usuario_id
      JOIN rol_permisos rp ON ur.rol_id = rp.rol_id
      JOIN permisos p ON rp.permiso_id = p.id
      WHERE u.id = ? AND u.activo = TRUE
    `;
        const [rows] = await this.pool.query(query, [usuarioId]);
        return rows.map(row => row.codigo);
    }
    async updatePassword(id, newPasswordHash) {
        await this.pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
        return { message: 'Contraseña actualizada' };
    }
    async update(id, updateUserDto) {
        const { nombre, email, rol_id } = updateUserDto;
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            if (nombre || email) {
                let updateQuery = 'UPDATE usuarios SET ';
                const params = [];
                if (nombre) {
                    updateQuery += 'nombre = ?, ';
                    params.push(nombre);
                }
                if (email) {
                    updateQuery += 'email = ?, ';
                    params.push(email);
                }
                updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
                params.push(id);
                await conn.query(updateQuery, params);
            }
            if (rol_id) {
                await conn.query('UPDATE usuario_roles SET rol_id = ? WHERE usuario_id = ?', [rol_id, id]);
            }
            await conn.commit();
            return { message: 'Usuario actualizado con éxito' };
        }
        catch (error) {
            await conn.rollback();
            throw new common_1.InternalServerErrorException('Error al actualizar usuario', error);
        }
        finally {
            conn.release();
        }
    }
    async updateStatus(id, activo) {
        await this.pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]);
        return { message: `Usuario ${activo ? 'activado' : 'desactivado'}` };
    }
    async getUserActivity(id) {
        const [users] = await this.pool.query('SELECT nombre, email FROM usuarios WHERE id = ?', [id]);
        if (users.length === 0)
            return null;
        const [invoices] = await this.pool.query(`SELECT id, invoiceNumber, date, total, paymentMethod 
       FROM invoices 
       WHERE id IN (SELECT invoiceId FROM journal_entries WHERE userId = ?)
       ORDER BY date DESC LIMIT 50`, [id]);
        const [sessions] = await this.pool.query(`SELECT status, openedAt, closedAt, initialBalance, finalBalance 
       FROM cash_register_sessions 
       WHERE userId = ? 
       ORDER BY openedAt DESC LIMIT 10`, [id]);
        return {
            user: users[0],
            invoices,
            sessions
        };
    }
    async obtenerUsuarioPorEmail(email) {
        const [rows] = await this.pool.query(`SELECT u.id, u.negocio_id, u.nombre, u.email, u.password_hash, r.nombre as rol
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id
       WHERE u.email = ? AND u.activo = TRUE LIMIT 1`, [email]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map