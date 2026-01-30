import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CredentialsService } from '../credentials/credentials.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private credentialsService: CredentialsService,
  ) {}

  /**
   * Start OAuth2 flow to connect Google Ads account
   * GET /api/v1/auth/google-ads/connect
   */
  @Get('google-ads/connect')
  @UseGuards(JwtAuthGuard)
  connectGoogleAds(@CurrentUser('userId') userId: string, @Res() res: Response) {
    const authUrl = this.authService.getGoogleAdsAuthUrl(userId);
    res.redirect(authUrl);
  }

  /**
   * OAuth2 callback from Google
   * GET /api/v1/auth/google-ads/callback
   */
  @Get('google-ads/callback')
  @Public()
  async googleAdsCallback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3001';

    if (error) {
      return res.redirect(
        `${frontendUrl}/settings/google-ads?error=${encodeURIComponent(error)}`,
      );
    }

    try {
      await this.authService.connectGoogleAds(userId, code);
      return res.redirect(`${frontendUrl}/settings/google-ads?success=true`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return res.redirect(
        `${frontendUrl}/settings/google-ads?error=${encodeURIComponent(message)}`,
      );
    }
  }

  /**
   * Disconnect Google Ads account
   * DELETE /api/v1/auth/google-ads/disconnect
   */
  @Delete('google-ads/disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnectGoogleAds(@CurrentUser('userId') userId: string) {
    await this.authService.disconnectGoogleAds(userId);
    return { success: true, message: 'Google Ads account disconnected' };
  }

  /**
   * Check if user has connected Google Ads
   * GET /api/v1/auth/google-ads/status
   */
  @Get('google-ads/status')
  @UseGuards(JwtAuthGuard)
  async getGoogleAdsStatus(@CurrentUser('userId') userId: string) {
    const credentials = await this.credentialsService.findByUserId(userId);

    return {
      connected: !!credentials,
      accessibleCustomerIds: credentials?.accessibleCustomerIds || [],
    };
  }
}
