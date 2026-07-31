import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        nombre: string;
        email: string;
        negocio_id: number;
    }>;
    findAll(): Promise<import("mysql2").RowDataPacket[]>;
    update(id: string, updateUserDto: any): Promise<{
        message: string;
    }>;
    updateStatus(id: string, activo: boolean): Promise<{
        message: string;
    }>;
    getUserActivity(id: string): Promise<{
        user: import("mysql2").RowDataPacket;
        invoices: import("mysql2").RowDataPacket[];
        sessions: import("mysql2").RowDataPacket[];
    } | null>;
}
