import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: { headers: { authorization?: string } }) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: unknown }) {
    return { user: req.user };
  }
}
