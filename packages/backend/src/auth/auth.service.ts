import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from '../credentials/credentials.service';
import axios from 'axios';

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

@Injectable()
export class AuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private configService: ConfigService,
    private credentialsService: CredentialsService,
  ) {
    this.clientId = configService.get<string>('GOOGLE_ADS_CLIENT_ID', '');
    this.clientSecret = configService.get<string>(
      'GOOGLE_ADS_CLIENT_SECRET',
      '',
    );
    this.redirectUri = configService.get<string>(
      'GOOGLE_ADS_REDIRECT_URI',
      'http://localhost:3000/api/v1/auth/google-ads/callback',
    );
  }

  getGoogleAdsAuthUrl(userId: string): string {
    const scopes = ['https://www.googleapis.com/auth/adwords'];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: userId, // Pass userId in state for callback
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokens> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data;
  }

  async connectGoogleAds(userId: string, code: string): Promise<void> {
    const tokens = await this.exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'No refresh token received. Please revoke access and try again.',
      );
    }

    // Get accessible customer IDs
    const accessibleCustomerIds =
      await this.getAccessibleCustomerIds(tokens.access_token);

    // Store credentials
    await this.credentialsService.saveCredentials(userId, {
      refreshToken: tokens.refresh_token,
      accessibleCustomerIds,
    });
  }

  async disconnectGoogleAds(userId: string): Promise<void> {
    await this.credentialsService.deleteCredentials(userId);
  }

  private async getAccessibleCustomerIds(
    accessToken: string,
  ): Promise<string[]> {
    try {
      const developerToken = this.configService.get<string>(
        'GOOGLE_ADS_DEVELOPER_TOKEN',
      );

      const response = await axios.get(
        'https://googleads.googleapis.com/v18/customers:listAccessibleCustomers',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': developerToken,
          },
        },
      );

      // Extract customer IDs from resource names (format: customers/1234567890)
      return (
        response.data.resourceNames?.map((name: string) =>
          name.replace('customers/', ''),
        ) || []
      );
    } catch {
      return [];
    }
  }
}
