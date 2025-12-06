// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // payload содержит sub, email и т.д.
      req['user'] = payload;
      return true;
    } catch (err) {
      // очистка/логирование можно делать выше по стэку
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(req: Request): string | undefined {
    const auth = req.headers.authorization;
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') return undefined;
    return token;
  }
}