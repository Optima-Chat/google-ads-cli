/**
 * Ad Commands - 广告管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { createCommand } from './create.js';
import { deleteCommand } from './delete.js';

export const adCommand = new Command('ad')
  .description('广告管理')
  .addCommand(listCommand)
  .addCommand(createCommand)
  .addCommand(deleteCommand);
