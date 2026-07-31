import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.obtenerUsuarioPorEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    let isPasswordValid = false;
    if (user.password_hash && user.password_hash.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    } else {
      isPasswordValid = (loginDto.password === user.password_hash);
    }
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: user.id, negocio_id: user.negocio_id };
    
    // Obtener permisos
    const permisos = await this.usersService.obtenerPermisosDeUsuario(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        negocio_id: user.negocio_id
      },
      roles: user.rol ? [user.rol] : [],
      permisos
    };
  }

  async updatePassword(userId: number, newPasswordHash: string) {
    return this.usersService.updatePassword(userId, newPasswordHash);
  }
}
