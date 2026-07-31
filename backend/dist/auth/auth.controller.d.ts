import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(): {
        message: string;
    };
    getProfile(req: any): any;
    updatePassword(req: any, body: any): Promise<{
        message: string;
    }>;
}
