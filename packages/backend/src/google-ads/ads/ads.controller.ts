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
    @Param('customerId') customerId: string,
    @Query() query: ListAdsQueryDto,
  ) {
    return this.adsService.list(customerId, query);
  }

  /**
   * Get ad by ID
   * GET /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Get(':adGroupId/:adId')
  async get(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
  ) {
    return this.adsService.get(customerId, adGroupId, adId);
  }

  /**
   * Create ad (Responsive Search Ad)
   * POST /api/v1/customers/:customerId/ads
   */
  @Post()
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateAdDto,
  ) {
    return this.adsService.create(customerId, dto);
  }

  /**
   * Update ad
   * PATCH /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Patch(':adGroupId/:adId')
  async update(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
    @Body() dto: UpdateAdDto,
  ) {
    return this.adsService.update(customerId, adGroupId, adId, dto);
  }

  /**
   * Delete ad
   * DELETE /api/v1/customers/:customerId/ads/:adGroupId/:adId
   */
  @Delete(':adGroupId/:adId')
  async delete(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('adId') adId: string,
  ) {
    return this.adsService.delete(customerId, adGroupId, adId);
  }
}
