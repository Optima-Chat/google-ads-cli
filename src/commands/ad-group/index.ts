/**
 * Ad Group Commands - 广告组管理
 */

import { Command } from 'commander';
import { createCommand } from './create.js';
import { deleteCommand } from './delete.js';

export const adGroupCommand = new Command('ad-group')
  .description('广告组管理')
  .addCommand(createCommand)
  .addCommand(deleteCommand);
