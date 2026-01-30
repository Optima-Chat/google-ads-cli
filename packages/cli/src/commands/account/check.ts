/**
 * Account Check Command - 检查账号配置状态
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const checkCommand = new Command('check')
  .description('检查账号配置状态（链接状态、权限等）')
  .action(async () => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // Check account via backend API
      const checkResult = await client.checkAccount(customerId) as any;

      // New format with status field
      const result = {
        customer_id: checkResult.customerId || customerId,
        status: checkResult.status || (checkResult.connected ? 'active' : 'not_linked'),
        message: checkResult.message || null,
        info: checkResult.info ? {
          name: checkResult.info.descriptive_name || null,
          currency: checkResult.info.currency_code || null,
          timezone: checkResult.info.time_zone || null,
        } : null,
      };

      console.log(JSON.stringify(result, null, 2));

    } catch (error) {
      handleError(error);
    }
  });
