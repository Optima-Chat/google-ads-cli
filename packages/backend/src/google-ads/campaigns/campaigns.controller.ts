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
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ListCampaignsQueryDto,
} from './campaigns.dto';

@Controller('customers/:customerId/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  /**
   * List campaigns
   * GET /api/v1/customers/:customerId/campaigns
   */
  @Get()
  async list(
    @Param('customerId') customerId: string,
    @Query() query: ListCampaignsQueryDto,
  ) {
    return this.campaignsService.list(customerId, query);
  }

  /**
   * Get campaign by ID
   * GET /api/v1/customers/:customerId/campaigns/:id
   */
  @Get(':id')
  async get(
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.get(customerId, campaignId);
  }

  /**
   * Create campaign
   * POST /api/v1/customers/:customerId/campaigns
   */
  @Post()
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(customerId, dto);
  }

  /**
   * Update campaign
   * PATCH /api/v1/customers/:customerId/campaigns/:id
   */
  @Patch(':id')
  async update(
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(customerId, campaignId, dto);
  }

  /**
   * Delete campaign
   * DELETE /api/v1/customers/:customerId/campaigns/:id
   */
  @Delete(':id')
  async delete(
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.delete(customerId, campaignId);
  }
}
