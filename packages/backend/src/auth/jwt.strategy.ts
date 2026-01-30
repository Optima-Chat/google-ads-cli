import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthClientService } from './auth-client.service';

export interface JwtPayload {
  sub: string; // user_id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

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
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authClientService: AuthClientService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 使用固定的 secret，实际验证由 user-auth 服务完成
      secretOrKeyProvider: async (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secretOrKey?: string) => void,
      ) => {
        try {
          // 使用 AuthClientService 验证 token
          const result =
            await this.authClientService.verifyUserToken(rawJwtToken);

          if (result.valid) {
            // Token 有效，返回一个占位 secret 让 passport-jwt 继续处理
            done(null, 'verified-by-user-auth');
          } else {
            done(new UnauthorizedException(result.error || 'Invalid token'));
          }
        } catch (error) {
          done(
            new UnauthorizedException(
              error instanceof Error ? error.message : 'Token validation failed',
            ),
          );
        }
      },
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
