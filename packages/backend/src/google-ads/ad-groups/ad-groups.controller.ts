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
import { AdGroupsService } from './ad-groups.service';
import {
  CreateAdGroupDto,
  UpdateAdGroupDto,
  ListAdGroupsQueryDto,
} from './ad-groups.dto';

@Controller('customers/:customerId/ad-groups')
@UseGuards(JwtAuthGuard)
export class AdGroupsController {
  constructor(private adGroupsService: AdGroupsService) {}

  /**
   * List ad groups
   * GET /api/v1/customers/:customerId/ad-groups
   */
  @Get()
  async list(
    @Param('customerId') customerId: string,
    @Query() query: ListAdGroupsQueryDto,
  ) {
    return this.adGroupsService.list(customerId, query);
  }

  /**
   * Get ad group by ID
   * GET /api/v1/customers/:customerId/ad-groups/:id
   */
  @Get(':id')
  async get(
    @Param('customerId') customerId: string,
    @Param('id') adGroupId: string,
  ) {
    return this.adGroupsService.get(customerId, adGroupId);
  }

  /**
   * Create ad group
   * POST /api/v1/customers/:customerId/ad-groups
   */
  @Post()
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateAdGroupDto,
  ) {
    return this.adGroupsService.create(customerId, dto);
  }

  /**
   * Update ad group
   * PATCH /api/v1/customers/:customerId/ad-groups/:id
   */
  @Patch(':id')
  async update(
    @Param('customerId') customerId: string,
    @Param('id') adGroupId: string,
    @Body() dto: UpdateAdGroupDto,
  ) {
    return this.adGroupsService.update(customerId, adGroupId, dto);
  }

  /**
   * Delete ad group
   * DELETE /api/v1/customers/:customerId/ad-groups/:id
   */
  @Delete(':id')
  async delete(
    @Param('customerId') customerId: string,
    @Param('id') adGroupId: string,
  ) {
    return this.adGroupsService.delete(customerId, adGroupId);
  }
}
