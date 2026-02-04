import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';

/**
 * OAuth service for third-party authentication providers
 * Handles Google, Yandex, and Mail.ru OAuth flows
 * TODO: Add error handling for network failures and invalid tokens
 */
@Injectable()
export class OauthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Google OAuth verification
   */
  async verifyGoogleCode(code: string) {
    const tokenRes = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }
    );

    const access_token = tokenRes.data.access_token;

    const profileRes = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
    );

    const p = profileRes.data;

    return {
      email: p.email,
      firstName: p.given_name,
      lastName: p.family_name,
      avatar: p.picture,
      provider: 'google',
    };
  }

  /**
   * Yandex OAuth verification
   */
  async verifyYandexCode(code: string) {
    const tokenRes = await axios.post(
      `https://oauth.yandex.ru/token`,
      {
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }
    );

    const access_token = tokenRes.data.access_token;

    const profileRes = await axios.get(
      `https://login.yandex.ru/info?format=json`,
      {
        headers: { Authorization: `OAuth ${access_token}` },
      }
    );

    const p = profileRes.data;

    return {
      email: p.default_email,
      firstName: p.first_name,
      lastName: p.last_name,
      avatar: p.avatar?.default,
      provider: 'yandex',
    };
  }

  /**
   * Mail.ru OAuth verification
   */
  async verifyMailRuCode(code: string) {
    const tokenRes = await axios.post(
      'https://oauth.mail.ru/token',
      {
        client_id: process.env.MAILRU_CLIENT_ID,
        client_secret: process.env.MAILRU_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }
    );

    const access_token = tokenRes.data.access_token;

    const profileRes = await axios.get(
      `https://oauth.mail.ru/userinfo?access_token=${access_token}`
    );

    const p = profileRes.data;

    return {
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      avatar: p.image,
      provider: 'mail',
    };
  }

  /**
   * Find existing user by email or create new OAuth user
   */
  async findOrCreateUserByEmail(profile: {
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    provider: string;
  }) {
    if (!profile.email) {
      throw new BadRequestException('OAuth provider did not return an email');
    }

    let user = await this.usersService.findByEmail(profile.email);

    if (user) return user;

    return await this.usersService.createOAuthUser({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      provider: profile.provider,
    });
  }
}