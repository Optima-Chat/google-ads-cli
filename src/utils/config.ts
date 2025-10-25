/**
 * 配置管理工具 - 纯环境变量方式
 */

import { GoogleAdsConfig } from '../config.js';

/**
 * 从环境变量加载配置
 */
export function loadConfig(): GoogleAdsConfig {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!developerToken || !clientId || !clientSecret) {
    throw new Error(
      '缺少必需的环境变量配置。请设置以下环境变量：\n\n' +
      '  GOOGLE_ADS_DEVELOPER_TOKEN\n' +
      '  GOOGLE_ADS_CLIENT_ID\n' +
      '  GOOGLE_ADS_CLIENT_SECRET\n\n' +
      '方式 1: 创建 .env 文件（推荐）\n' +
      '  复制 .env.example 为 .env 并填入实际值\n\n' +
      '方式 2: 导出环境变量\n' +
      '  export GOOGLE_ADS_DEVELOPER_TOKEN=xxx\n' +
      '  export GOOGLE_ADS_CLIENT_ID=xxx\n' +
      '  export GOOGLE_ADS_CLIENT_SECRET=xxx\n\n' +
      '详见: https://github.com/Optima-Chat/google-ads-cli#readme'
    );
  }

  return {
    developerToken,
    clientId,
    clientSecret,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    defaultCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    outputFormat: (process.env.GOOGLE_ADS_OUTPUT_FORMAT as any) || 'table',
    colorOutput: process.env.GOOGLE_ADS_COLOR_OUTPUT !== 'false',
  };
}
