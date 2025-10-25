/**
 * Customer ID 获取工具
 */

import Conf from 'conf';

const config = new Conf({ projectName: 'google-ads-cli' });

/**
 * 获取 Customer ID（从 CLI config 或环境变量）
 * @returns Customer ID
 * @throws 如果既没有配置也没有设置环境变量
 */
export function getCustomerId(): string {
  // 1. 优先从 CLI config 读取（account create 保存的）
  const configCustomerId = config.get('customerId') as string | undefined;
  if (configCustomerId) {
    return configCustomerId;
  }

  // 2. 从环境变量读取（用于手动配置的情况）
  const envCustomerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  if (envCustomerId) {
    return envCustomerId;
  }

  // 3. 都没有则报错
  throw new Error(
    '未找到 Google Ads 账号配置\n\n' +
      '请先创建您的账号：\n' +
      '  google-ads account create --email <your-email> --name <your-name>\n\n' +
      '或者在 .env 文件中手动配置：\n' +
      '  GOOGLE_ADS_CUSTOMER_ID=your-customer-id'
  );
}
