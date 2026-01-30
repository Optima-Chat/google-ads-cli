/**
 * Keyword Commands - 关键词管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { addCommand } from './add.js';
import { updateCommand } from './update.js';
import { deleteCommand } from './delete.js';

export const keywordCommand = new Command('keyword')
  .description('关键词管理')
  .addCommand(listCommand)
  .addCommand(addCommand)
  .addCommand(updateCommand)
  .addCommand(deleteCommand);
