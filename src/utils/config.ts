/**
 * 配置管理工具
 */

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { GoogleAdsConfig, CONFIG_DIR, CONFIG_FILE } from '../config.js';

/**
 * 获取配置目录路径
 */
export function getConfigDir(): string {
  return join(homedir(), CONFIG_DIR);
}

/**
 * 获取配置文件路径
 */
export function getConfigPath(): string {
  return join(getConfigDir(), CONFIG_FILE);
}

/**
 * 检查配置文件是否存在
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}

/**
 * 加载配置（优先级链：环境变量 > 文件 > 默认值）
 */
export function loadConfig(): GoogleAdsConfig {
  // 1. 从环境变量加载
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    return {
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      defaultCustomerId: process.env.GOOGLE_ADS_DEFAULT_CUSTOMER_ID,
      outputFormat: (process.env.GOOGLE_ADS_OUTPUT_FORMAT as any) || 'table',
      colorOutput: process.env.GOOGLE_ADS_COLOR_OUTPUT !== 'false',
    };
  }

  // 2. 从配置文件加载
  if (configExists()) {
    const config = JSON.parse(readFileSync(getConfigPath(), 'utf-8'));
    return {
      ...config,
      outputFormat: config.outputFormat || 'table',
      colorOutput: config.colorOutput !== false,
    };
  }

  // 3. 返回默认配置（空）
  throw new Error(
    '配置文件不存在，请先运行: google-ads init\n' +
      '或设置环境变量: GOOGLE_ADS_DEVELOPER_TOKEN'
  );
}

/**
 * 保存配置到文件
 */
export function saveConfig(config: GoogleAdsConfig): void {
  const configDir = getConfigDir();

  // 确保目录存在
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // 写入配置文件
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * 更新配置的某个字段
 */
export function updateConfig(key: keyof GoogleAdsConfig, value: any): void {
  const config = loadConfig();
  (config as any)[key] = value;
  saveConfig(config);
}
