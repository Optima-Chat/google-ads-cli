/**
 * Campaign Create Command - 创建广告系列
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const createCommand = new Command('create')
  .description('创建广告系列')
  .requiredOption('-n, --name <name>', '广告系列名称')
  .requiredOption('-b, --budget <amount>', '每日预算（美元）', parseFloat)
  .option('--status <status>', '状态 (ENABLED, PAUSED)', 'PAUSED')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const budgetMicros = Math.round(options.budget * 1000000);

      const result = await client.createCampaign(customerId, {
        name: options.name,
        budgetAmountMicros: budgetMicros,
        status: options.status,
      });

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
