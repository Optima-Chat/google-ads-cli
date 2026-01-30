/**
 * Campaign Targeting Commands - 广告系列定向管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { addCommand } from './add.js';
import { removeCommand } from './remove.js';

export const targetingCommand = new Command('targeting')
  .description('广告系列定向管理')
  .addCommand(listCommand)
  .addCommand(addCommand)
  .addCommand(removeCommand);
