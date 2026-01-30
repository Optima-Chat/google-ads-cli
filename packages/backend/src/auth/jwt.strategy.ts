import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthClientService } from './auth-client.service';

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  role?: string;
}

/**
 * JWT Strategy using OAuth 2.0 Client Credentials
 *
 * 使用 user-auth 服务验证用户 token
 * 通过 Client Credentials 流程获取服务 token，然后调用 /auth/verify 验证用户 token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authClientService: AuthClientService) {
    super();
  }

  async validate(req: Request): Promise<AuthenticatedUser> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new UnauthorizedException('Token is empty');
    }

    const result = await this.authClientService.verifyUserToken(token);

    if (!result.valid) {
      throw new UnauthorizedException(result.error || 'Invalid token');
    }

    return {
      userId: result.user_id!,
      email: result.email,
      role: result.role,
    };
  }
}
