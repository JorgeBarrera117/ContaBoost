import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('users')
@RequirePermissions('usuarios.gestionar')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('activo') activo: boolean) {
    return this.usersService.updateStatus(+id, activo);
  }

  @Get(':id/activity')
  getUserActivity(@Param('id') id: string) {
    return this.usersService.getUserActivity(+id);
  }
}
