import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto, ListAdsQueryDto } from './ads.dto';

@Controller('customers/:customerId/ads')
@UseGuards(JwtAuthGuard)
export class AdsController {
  constructor(private adsService: AdsService) {}

  /**
   * List ads
   * GET /api/v1/customers/:customerId/ads
   */
  @Get()
  async list(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Query() query: ListAdsQueryDto,
  ) {
    return this.adsService.list(userId, customerId, query);
  }

  /**
   * Get ad by ID
   * GET /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Get(':adGroupId/:adId')
  async get(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
  ) {
    return this.adsService.get(userId, customerId, adGroupId, adId);
  }

  /**
   * Create ad (Responsive Search Ad)
   * POST /api/v1/customers/:customerId/ads
   */
  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Body() dto: CreateAdDto,
  ) {
    return this.adsService.create(userId, customerId, dto);
  }

  /**
   * Update ad
   * PATCH /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Patch(':adGroupId/:adId')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
    @Body() dto: UpdateAdDto,
  ) {
    return this.adsService.update(userId, customerId, adGroupId, adId, dto);
  }

  /**
   * Delete ad
   * DELETE /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Delete(':adGroupId/:adId')
  async delete(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
  ) {
    return this.adsService.delete(userId, customerId, adGroupId, adId);
  }
}
