/**
 * 错误处理工具
 */

import chalk from 'chalk';
import { error as logError } from './logger.js';

/**
 * 自定义错误类
 */
export class GoogleAdsError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GoogleAdsError';
  }
}

/**
 * 配置错误
 */
export class ConfigError extends GoogleAdsError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

/**
 * 认证错误
 */
export class AuthError extends GoogleAdsError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

/**
 * 处理并显示错误
 */
export function handleError(err: any): void {
  if (err instanceof GoogleAdsError) {
    logError(err.message);
    if (err.details) {
      console.error(chalk.gray('详情:'), err.details);
    }
  } else if (err.message) {
    logError(err.message);
  } else {
    logError('未知错误');
    console.error(err);
  }

  process.exit(1);
}

/**
 * 格式化友好的错误信息
 */
export function formatError(err: any): string {
  if (err instanceof GoogleAdsError) {
    return chalk.red(`✗ ${err.message}`);
  }

  if (err.message) {
    return chalk.red(`✗ ${err.message}`);
  }

  return chalk.red('✗ 未知错误');
}
