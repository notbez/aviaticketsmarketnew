// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthDto, AppleOAuthDto } from './dto/oauth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleAuth(@Body() googleDto: GoogleOAuthDto) {
    return this.authService.googleAuth(googleDto);
  }

  @Post('apple')
  async appleAuth(@Body() appleDto: AppleOAuthDto) {
    return this.authService.appleAuth(appleDto);
  }
}