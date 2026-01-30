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
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Query() query: ListCampaignsQueryDto,
  ) {
    return this.campaignsService.list(userId, customerId, query);
  }

  /**
   * Get campaign by ID
   * GET /api/v1/customers/:customerId/campaigns/:id
   */
  @Get(':id')
  async get(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.get(userId, customerId, campaignId);
  }

  /**
   * Create campaign
   * POST /api/v1/customers/:customerId/campaigns
   */
  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(userId, customerId, dto);
  }

  /**
   * Update campaign
   * PATCH /api/v1/customers/:customerId/campaigns/:id
   */
  @Patch(':id')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(userId, customerId, campaignId, dto);
  }

  /**
   * Delete campaign
   * DELETE /api/v1/customers/:customerId/campaigns/:id
   */
  @Delete(':id')
  async delete(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.delete(userId, customerId, campaignId);
  }
}
