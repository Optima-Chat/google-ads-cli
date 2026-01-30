import { Module } from '@nestjs/common';
import { GoogleAdsService } from './google-ads.service';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';
import { AdGroupsController } from './ad-groups/ad-groups.controller';
import { AdGroupsService } from './ad-groups/ad-groups.service';
import { KeywordsController } from './keywords/keywords.controller';
import { KeywordsService } from './keywords/keywords.service';
import { AdsController } from './ads/ads.controller';
import { AdsService } from './ads/ads.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';
import { AccountsController } from './accounts.controller';
import { CredentialsModule } from '../credentials/credentials.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CredentialsModule, AuthModule],
  controllers: [
    AccountsController,
    CampaignsController,
    AdGroupsController,
    KeywordsController,
    AdsController,
    QueryController,
  ],
  providers: [
    GoogleAdsService,
    CampaignsService,
    AdGroupsService,
    KeywordsService,
    AdsService,
    QueryService,
  ],
  exports: [GoogleAdsService],
})
export class GoogleAdsModule {}
