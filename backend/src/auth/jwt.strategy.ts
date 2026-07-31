import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key', // En prod, usar variable de entorno
    });
  }

  async validate(payload: any) {
    // Aquí el payload es lo que firmamos en el token.
    // Retornamos el id del usuario que será inyectado en req.user
    // Podemos validar si el usuario sigue activo en la DB si queremos más seguridad
    return { id: payload.sub, email: payload.email, negocio_id: payload.negocio_id };
  }
}
