/**
 * .env 文件更新工具
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 更新 .env 文件中的特定变量
 */
export function updateEnvFile(key: string, value: string): void {
  // .env 文件路径（假设在项目根目录）
  const envPath = join(process.cwd(), '.env');

  let envContent = '';

  // 如果文件存在，读取现有内容
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }

  const lines = envContent.split('\n');
  let found = false;

  // 查找并更新目标行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 跳过注释和空行
    if (line.startsWith('#') || line === '') {
      continue;
    }

    // 检查是否是目标变量
    if (line.startsWith(`${key}=`) || line.startsWith(`# ${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }

  // 如果没找到，追加到文件末尾
  if (!found) {
    // 确保最后有换行
    if (envContent && !envContent.endsWith('\n')) {
      lines.push('');
    }
    lines.push(`# OAuth2 Refresh Token（通过 google-ads auth login 自动获取）`);
    lines.push(`${key}=${value}`);
  }

  // 写回文件
  writeFileSync(envPath, lines.join('\n'), 'utf-8');
}
