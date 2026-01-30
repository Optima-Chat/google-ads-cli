import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import axios from 'axios';

export interface JwtPayload {
  sub: string; // user_id
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secretOrKey?: string) => void,
      ) => {
        try {
          // Validate token with user-auth service
          const userAuthUrl = configService.get<string>(
            'USER_AUTH_URL',
            'https://user-auth.optima.onl',
          );

          const response = await axios.get(`${userAuthUrl}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${rawJwtToken}` },
          });

          if (response.data?.id) {
            // Use a static secret since we validated with user-auth
            done(null, configService.get('JWT_SECRET', 'optima-ads-secret'));
          } else {
            done(new UnauthorizedException('Invalid token'));
          }
        } catch {
          done(new UnauthorizedException('Token validation failed'));
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
    };
  }
}
