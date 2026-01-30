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
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Query() query: ListKeywordsQueryDto,
  ) {
    return this.keywordsService.list(userId, customerId, query);
  }

  /**
   * Add keywords to ad group
   * POST /api/v1/customers/:customerId/keywords
   */
  @Post()
  async add(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Body() dto: AddKeywordsDto,
  ) {
    return this.keywordsService.add(userId, customerId, dto);
  }

  /**
   * Update keyword
   * PATCH /api/v1/customers/:customerId/keywords/:adGroupId/:criterionId
   */
  @Patch(':adGroupId/:criterionId')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('criterionId') criterionId: string,
    @Body() dto: UpdateKeywordDto,
  ) {
    return this.keywordsService.update(
      userId,
      customerId,
      adGroupId,
      criterionId,
      dto,
    );
  }

  /**
   * Delete keyword
   * DELETE /api/v1/customers/:customerId/keywords/:adGroupId/:criterionId
   */
  @Delete(':adGroupId/:criterionId')
  async delete(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Param('adGroupId') adGroupId: string,
    @Param('criterionId') criterionId: string,
  ) {
    return this.keywordsService.delete(
      userId,
      customerId,
      adGroupId,
      criterionId,
    );
  }
}
