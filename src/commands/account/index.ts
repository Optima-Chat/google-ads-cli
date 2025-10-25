/**
 * Account Commands - 账号管理
 */

import { Command } from 'commander';
import { listCommand } from './list.js';
import { infoCommand } from './info.js';
import { checkCommand } from './check.js';
import { createCommand } from './create.js';

export const accountCommand = new Command('account')
  .description('账号管理')
  .addCommand(listCommand)
  .addCommand(infoCommand)
  .addCommand(checkCommand)
  .addCommand(createCommand);
