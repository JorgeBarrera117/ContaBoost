import { Controller, Get, Post, Put, Body, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logout exitoso' };
  }

  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Put('me/password')
  async updatePassword(@Request() req: any, @Body() body: any) {
    const { password } = body;
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    return this.authService.updatePassword(req.user.sub, hash);
  }
}
