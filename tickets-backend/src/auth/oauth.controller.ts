import { Controller, Post, Body } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly authService: AuthService,
  ) {}

  @Post('google')
  async googleOAuth(@Body('code') code: string) {
    const profile = await this.oauthService.verifyGoogleCode(code);
    const user = await this.oauthService.findOrCreateUserByEmail(profile);

    const token = await this.authService.generateJwt(user);
    return { accessToken: token, user };
  }

  @Post('yandex')
  async yandexOAuth(@Body('code') code: string) {
    const profile = await this.oauthService.verifyYandexCode(code);
    const user = await this.oauthService.findOrCreateUserByEmail(profile);

    const token = await this.authService.generateJwt(user);
    return { accessToken: token, user };
  }

  @Post('mail')
  async mailOAuth(@Body('code') code: string) {
    const profile = await this.oauthService.verifyMailRuCode(code);
    const user = await this.oauthService.findOrCreateUserByEmail(profile);

    const token = await this.authService.generateJwt(user);
    return { accessToken: token, user };
  }
}