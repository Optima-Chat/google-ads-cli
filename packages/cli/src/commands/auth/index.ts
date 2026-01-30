/**
 * Auth Commands - 认证管理
 */

import { Command } from 'commander';
import { loginCommand } from './login.js';
import { logoutCommand } from './logout.js';
import { statusCommand } from './status.js';

export const authCommand = new Command('auth')
  .description('认证管理')
  .addCommand(loginCommand)
  .addCommand(logoutCommand)
  .addCommand(statusCommand);
