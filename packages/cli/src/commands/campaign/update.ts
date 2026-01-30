/**
 * Campaign Update Command - 更新广告系列
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告系列')
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--name <name>', '新名称')
  .option('--budget <amount>', '新每日预算（美元）')
  .action(async (options) => {
    try {
      if (!options.status && !options.name && !options.budget) {
        console.log(JSON.stringify({
          error: 'missing_fields',
          message: '请至少指定一个要更新的字段: --status, --name, 或 --budget'
        }, null, 2));
        process.exit(1);
      }

      const customerId = getCustomerId();
      const client = getApiClient();

      const updateData: any = {};
      if (options.status) updateData.status = options.status;
      if (options.name) updateData.name = options.name;
      if (options.budget) updateData.budgetAmountMicros = Math.round(parseFloat(options.budget) * 1000000);

      const result = await client.updateCampaign(customerId, options.campaignId, updateData);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
