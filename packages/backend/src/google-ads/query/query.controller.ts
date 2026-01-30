import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { QueryService } from './query.service';
import { ExecuteQueryDto } from './query.dto';

@Controller('customers/:customerId/query')
@UseGuards(JwtAuthGuard)
export class QueryController {
  constructor(private queryService: QueryService) {}

  /**
   * Execute GAQL query
   * POST /api/v1/customers/:customerId/query
   */
  @Post()
  async execute(
    @CurrentUser('userId') userId: string,
    @Param('customerId') customerId: string,
    @Body() dto: ExecuteQueryDto,
  ) {
    return this.queryService.execute(userId, customerId, dto.query);
  }
}
