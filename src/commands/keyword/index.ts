/**
 * Keyword Commands - 关键词管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';

export const keywordCommand = new Command('keyword')
  .description('关键词管理')
  .addCommand(listCommand);
