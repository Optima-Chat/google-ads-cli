import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthClientService } from './auth-client.service';
import { GoogleAdsModule } from '../google-ads/google-ads.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    forwardRef(() => GoogleAdsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthClientService, JwtStrategy],
  exports: [PassportModule, AuthService, AuthClientService],
})
export class AuthModule {}
