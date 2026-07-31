import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true; // Si no hay permisos requeridos, dejamos pasar
    }

    const request = context.switchToHttp().getRequest();
    // NOTA: Asumimos que ya hay un AuthGuard previo que inyecta 'req.user' (ej. JWT)
    // Para simplificar la prueba y desarrollo, si no hay user, devolvemos false o usamos un ID de prueba (por ahora).
    const userId = request.user?.id; 

    if (!userId) {
      throw new ForbiddenException('No hay sesión activa (Falta req.user)');
    }

    // Usamos el servicio de usuarios para obtener los permisos del RBAC
    const userPermissions = await this.usersService.obtenerPermisosDeUsuario(userId);

    const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      throw new ForbiddenException('No estás autorizado para realizar esta acción');
    }

    return true;
  }
}
