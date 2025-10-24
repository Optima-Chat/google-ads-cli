/**
 * Campaign Commands - 广告系列管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { infoCommand } from './info.js';

export const campaignCommand = new Command('campaign')
  .description('广告系列管理')
  .addCommand(listCommand)
  .addCommand(infoCommand);
