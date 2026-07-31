export class CreateUserDto {
  negocio_id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol_id: number; // Rol a asignar al nuevo usuario
}
