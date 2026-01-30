import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleAdsCredential } from './credentials.entity';
import { CredentialsService } from './credentials.service';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleAdsCredential])],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
