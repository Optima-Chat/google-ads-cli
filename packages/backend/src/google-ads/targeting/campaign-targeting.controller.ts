import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CampaignTargetingService } from './campaign-targeting.service';
import { AddTargetingDto } from './dto/add-targeting.dto';

@Controller('customers/:customerId/campaigns/:campaignId/targeting')
@UseGuards(JwtAuthGuard)
export class CampaignTargetingController {
  constructor(private campaignTargetingService: CampaignTargetingService) {}

  /**
   * List campaign targeting criteria
   * GET /api/v1/customers/:customerId/campaigns/:campaignId/targeting
   */
  @Get()
  async list(
    @Param('customerId') customerId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignTargetingService.list(customerId, campaignId);
  }

  /**
   * Add campaign targeting criterion
   * POST /api/v1/customers/:customerId/campaigns/:campaignId/targeting
   */
  @Post()
  async add(
    @Param('customerId') customerId: string,
    @Param('campaignId') campaignId: string,
    @Body() dto: AddTargetingDto,
  ) {
    return this.campaignTargetingService.add(customerId, campaignId, dto);
  }

  /**
   * Remove campaign targeting criterion
   * DELETE /api/v1/customers/:customerId/campaigns/:campaignId/targeting/:criterionId
   */
  @Delete(':criterionId')
  async remove(
    @Param('customerId') customerId: string,
    @Param('campaignId') campaignId: string,
    @Param('criterionId') criterionId: string,
  ) {
    return this.campaignTargetingService.remove(
      customerId,
      campaignId,
      criterionId,
    );
  }
}
