/**
 * Ad Group Commands - 广告组管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { infoCommand } from './info.js';
import { createCommand } from './create.js';
import { updateCommand } from './update.js';
import { deleteCommand } from './delete.js';
import { targetingCommand } from './targeting/index.js';

export const adGroupCommand = new Command('ad-group')
  .description('广告组管理')
  .addCommand(listCommand)
  .addCommand(infoCommand)
  .addCommand(createCommand)
  .addCommand(updateCommand)
  .addCommand(deleteCommand)
  .addCommand(targetingCommand);
