/**
 * Campaign Info Command - 查看广告系列详情
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const infoCommand = new Command('info')
  .description('查看广告系列详情')
  .argument('<campaign-id>', '广告系列 ID')
  .action(async (campaignId: string) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const campaign = await client.getCampaign(customerId, campaignId);

      if (!campaign) {
        console.log(JSON.stringify({ error: 'not_found', campaign_id: campaignId }, null, 2));
        process.exit(1);
      }

      console.log(JSON.stringify(campaign, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
