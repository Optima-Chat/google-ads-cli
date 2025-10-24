/**
 * Auth Login Command - OAuth2 登录
 */

import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import ora from 'ora';
import { OAuth2Manager } from '../../lib/oauth2-manager.js';
import { CallbackServer } from '../../lib/callback-server.js';
import { saveToken, getCredentialsPath } from '../../lib/token-store.js';
import { configExists } from '../../utils/config.js';
import { success, error as logError, info } from '../../utils/logger.js';
import { handleError } from '../../utils/errors.js';

export const loginCommand = new Command('login')
  .description('登录 Google Ads 账号（OAuth2 授权）')
  .option('--port <port>', '回调服务器端口', '9001')
  .option('--no-open', '不自动打开浏览器')
  .action(async (options) => {
    try {
      // 检查配置
      if (!configExists()) {
        logError('配置文件不存在，请先运行: google-ads init');
        process.exit(1);
      }

      console.log(chalk.cyan.bold('\n🔐 正在启动 OAuth2 认证...\n'));

      const oauth = new OAuth2Manager();
      const port = parseInt(options.port);
      const server = new CallbackServer(port);

      // 1. 启动本地回调服务器
      let spinner = ora('启动本地回调服务器...').start();
      try {
        await server.start();
        spinner.succeed(`本地回调服务器已启动: http://localhost:${port}`);
      } catch (error: any) {
        spinner.fail('启动服务器失败');
        throw error;
      }

      // 2. 生成授权 URL
      const redirectUri = `http://localhost:${port}/callback`;
      const authUrl = oauth.getAuthorizationUrl(redirectUri);

      console.log();
      console.log(chalk.yellow('🌐 请在浏览器中完成授权...'));
      if (!options.open) {
        console.log(chalk.gray('   请访问以下 URL:'));
        console.log(chalk.cyan(`   ${authUrl}`));
      }
      console.log();

      // 3. 打开浏览器
      if (options.open) {
        try {
          await open(authUrl);
          info('浏览器已打开，请在浏览器中完成授权');
        } catch (error) {
          console.log(chalk.gray('   无法自动打开浏览器，请手动访问:'));
          console.log(chalk.cyan(`   ${authUrl}`));
        }
      }

      // 4. 等待回调
      spinner = ora('等待授权...').start();
      let code: string;
      try {
        code = await server.waitForCallback();
        spinner.succeed('授权成功！');
      } catch (error: any) {
        spinner.fail('授权失败');
        await server.close();
        throw error;
      }

      // 5. 交换 token
      spinner = ora('正在获取 Access Token...').start();
      try {
        const token = await oauth.exchangeCodeForToken(code, redirectUri);
        spinner.succeed('Access Token 已获取');

        // 6. 保存 token
        saveToken(token);
        success(`Refresh Token 已保存到: ${getCredentialsPath()}`);
      } catch (error: any) {
        spinner.fail('获取 Token 失败');
        await server.close();
        throw error;
      }

      // 7. 关闭服务器
      await server.close();

      // 8. 显示下一步提示
      console.log();
      console.log(chalk.green('✅ 登录成功！\n'));
      console.log(chalk.yellow('下一步:'));
      console.log(chalk.gray('  1. 查看账号列表: ') + chalk.cyan('google-ads account list'));
      console.log(chalk.gray('  2. 查看认证状态: ') + chalk.cyan('google-ads auth status'));
      console.log();
    } catch (error) {
      handleError(error);
    }
  });
