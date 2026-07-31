import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private pool;
    constructor(pool: Pool);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        nombre: string;
        email: string;
        negocio_id: number;
    }>;
    findAll(): Promise<RowDataPacket[]>;
    obtenerPermisosDeUsuario(usuarioId: number): Promise<string[]>;
    updatePassword(id: number, newPasswordHash: string): Promise<{
        message: string;
    }>;
    update(id: number, updateUserDto: any): Promise<{
        message: string;
    }>;
    updateStatus(id: number, activo: boolean): Promise<{
        message: string;
    }>;
    getUserActivity(id: number): Promise<{
        user: RowDataPacket;
        invoices: RowDataPacket[];
        sessions: RowDataPacket[];
    } | null>;
    obtenerUsuarioPorEmail(email: string): Promise<RowDataPacket | null>;
}
