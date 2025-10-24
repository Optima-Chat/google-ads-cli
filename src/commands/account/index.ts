/**
 * Account Commands - 账号管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { infoCommand } from './info.js';

export const accountCommand = new Command('account')
  .description('账号管理')
  .addCommand(listCommand)
  .addCommand(infoCommand);
