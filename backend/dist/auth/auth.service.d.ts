import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        usuario: {
            id: any;
            nombre: any;
            email: any;
            negocio_id: any;
        };
        roles: any[];
        permisos: string[];
    }>;
    updatePassword(userId: number, newPasswordHash: string): Promise<{
        message: string;
    }>;
}
