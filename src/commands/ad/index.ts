/**
 * Ad Commands - 广告管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { infoCommand } from './info.js';
import { createCommand } from './create.js';
import { updateCommand } from './update.js';
import { deleteCommand } from './delete.js';

export const adCommand = new Command('ad')
  .description('广告管理')
  .addCommand(listCommand)
  .addCommand(infoCommand)
  .addCommand(createCommand)
  .addCommand(updateCommand)
  .addCommand(deleteCommand);
