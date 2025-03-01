import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from 'src/Dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  public async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}