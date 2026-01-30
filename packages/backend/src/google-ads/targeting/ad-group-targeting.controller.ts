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
import { AdGroupTargetingService } from './ad-group-targeting.service';
import { AddTargetingDto } from './dto/add-targeting.dto';

@Controller('customers/:customerId/ad-groups/:adGroupId/targeting')
@UseGuards(JwtAuthGuard)
export class AdGroupTargetingController {
  constructor(private adGroupTargetingService: AdGroupTargetingService) {}

  /**
   * List ad group targeting criteria
   * GET /api/v1/customers/:customerId/ad-groups/:adGroupId/targeting
   */
  @Get()
  async list(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
  ) {
    return this.adGroupTargetingService.list(customerId, adGroupId);
  }

  /**
   * Add ad group targeting criterion
   * POST /api/v1/customers/:customerId/ad-groups/:adGroupId/targeting
   */
  @Post()
  async add(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Body() dto: AddTargetingDto,
  ) {
    return this.adGroupTargetingService.add(customerId, adGroupId, dto);
  }

  /**
   * Remove ad group targeting criterion
   * DELETE /api/v1/customers/:customerId/ad-groups/:adGroupId/targeting/:criterionId
   */
  @Delete(':criterionId')
  async remove(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('criterionId') criterionId: string,
  ) {
    return this.adGroupTargetingService.remove(
      customerId,
      adGroupId,
      criterionId,
    );
  }
}
