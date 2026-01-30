import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleAdsCredential } from './credentials.entity';
import axios from 'axios';

export interface SaveCredentialsDto {
  refreshToken: string;
  mccAccountId?: string;
  accessibleCustomerIds?: string[];
}

@Injectable()
export class CredentialsService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    @InjectRepository(GoogleAdsCredential)
    private credentialsRepository: Repository<GoogleAdsCredential>,
    private configService: ConfigService,
  ) {
    this.clientId = configService.get<string>('GOOGLE_ADS_CLIENT_ID', '');
    this.clientSecret = configService.get<string>(
      'GOOGLE_ADS_CLIENT_SECRET',
      '',
    );
  }

  async findByUserId(userId: string): Promise<GoogleAdsCredential | null> {
    return this.credentialsRepository.findOne({ where: { userId } });
  }

  async saveCredentials(
    userId: string,
    dto: SaveCredentialsDto,
  ): Promise<GoogleAdsCredential> {
    let credentials = await this.findByUserId(userId);

    if (credentials) {
      // Update existing
      credentials.refreshToken = dto.refreshToken;
      credentials.mccAccountId = dto.mccAccountId;
      credentials.accessibleCustomerIds = dto.accessibleCustomerIds;
    } else {
      // Create new
      credentials = this.credentialsRepository.create({
        userId,
        ...dto,
      });
    }

    return this.credentialsRepository.save(credentials);
  }

  async deleteCredentials(userId: string): Promise<void> {
    const result = await this.credentialsRepository.delete({ userId });
    if (result.affected === 0) {
      throw new NotFoundException('Credentials not found');
    }
  }

  async getAccessToken(userId: string): Promise<string> {
    const credentials = await this.findByUserId(userId);

    if (!credentials) {
      throw new NotFoundException('Google Ads not connected');
    }

    // Exchange refresh token for access token
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data.access_token;
  }

  async updateAccessibleCustomerIds(
    userId: string,
    customerIds: string[],
  ): Promise<void> {
    await this.credentialsRepository.update(
      { userId },
      { accessibleCustomerIds: customerIds },
    );
  }
}
