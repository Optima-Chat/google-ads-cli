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
import { KeywordsService } from './keywords.service';
import {
  AddKeywordsDto,
  UpdateKeywordDto,
  ListKeywordsQueryDto,
} from './keywords.dto';

@Controller('customers/:customerId/keywords')
@UseGuards(JwtAuthGuard)
export class KeywordsController {
  constructor(private keywordsService: KeywordsService) {}

  /**
   * List keywords
   * GET /api/v1/customers/:customerId/keywords
   */
  @Get()
  async list(
    @Param('customerId') customerId: string,
    @Query() query: ListKeywordsQueryDto,
  ) {
    return this.keywordsService.list(customerId, query);
  }

  /**
   * Add keywords to ad group
   * POST /api/v1/customers/:customerId/keywords
   */
  @Post()
  async add(
    @Param('customerId') customerId: string,
    @Body() dto: AddKeywordsDto,
  ) {
    return this.keywordsService.add(customerId, dto);
  }

  /**
   * Update keyword
   * PATCH /api/v1/customers/:customerId/keywords/:adGroupId/:criterionId
   */
  @Patch(':adGroupId/:criterionId')
  async update(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('criterionId') criterionId: string,
    @Body() dto: UpdateKeywordDto,
  ) {
    return this.keywordsService.update(customerId, adGroupId, criterionId, dto);
  }

  /**
   * Delete keyword
   * DELETE /api/v1/customers/:customerId/keywords/:adGroupId/:criterionId
   */
  @Delete(':adGroupId/:criterionId')
  async delete(
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('criterionId') criterionId: string,
  ) {
    return this.keywordsService.delete(customerId, adGroupId, criterionId);
  }
}
