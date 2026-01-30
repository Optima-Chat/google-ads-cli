/**
 * Auth Login Command - Device Flow 登录
 *
 * 使用 OAuth2 Device Flow 进行登录，与 optima-agent 兼容
 */

import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import ora, { Ora } from 'ora';
import { startDeviceFlow } from '../../lib/device-flow.js';
import { getTokenData, isTokenExpired } from '../../lib/token-store.js';
import type { Environment } from '../../lib/auth-types.js';
import { handleError } from '../../utils/errors.js';

export const loginCommand = new Command('login')
  .description('登录 Optima 账号')
  .option('--env <env>', '环境 (ci/stage/prod)', 'prod')
  .option('--no-open', '不自动打开浏览器')
  .action(async (options) => {
    try {
      // 检查是否已登录
      const existingToken = getTokenData();
      if (existingToken && !isTokenExpired(existingToken)) {
        const user = existingToken.user;
        console.log();
        console.log(chalk.yellow('⚠️  您已登录'));
        if (user?.email) {
          console.log(chalk.gray(`   账号: ${user.email}`));
        }
        console.log(chalk.gray(`   环境: ${existingToken.env}`));
        console.log();
        console.log(chalk.gray('如需重新登录，请先运行: ') + chalk.cyan('google-ads auth logout'));
        console.log();
        return;
      }

      const env = options.env as Environment;

      console.log();
      console.log(chalk.cyan.bold('🔐 登录 Optima 账号'));
      console.log(chalk.gray(`   环境: ${env}`));
      console.log();

      let spinner: Ora | null = null;
      let codeDisplayed = false;

      await startDeviceFlow(env, {
        onCodeReceived: (code, uri) => {
          codeDisplayed = true;
          console.log(chalk.yellow('请在浏览器中完成登录：'));
          console.log();
          console.log(chalk.white.bold(`   验证码: ${code}`));
          console.log();
          console.log(chalk.gray('   或直接访问:'));
          console.log(chalk.cyan(`   ${uri}`));
          console.log();

          // 自动打开浏览器
          if (options.open) {
            open(uri).catch(() => {
              // 打开失败时静默处理
            });
          }

          spinner = ora('等待授权...').start();
        },

        onPolling: () => {
          // 轮询时更新 spinner（可选）
        },

        onSuccess: (user) => {
          spinner?.succeed('登录成功！');
          console.log();
          console.log(chalk.green('✅ 已登录'));
          if (user.email) {
            console.log(chalk.gray(`   账号: ${user.email}`));
          }
          console.log();
          console.log(chalk.yellow('下一步:'));
          console.log(chalk.gray('  查看可用账号: ') + chalk.cyan('google-ads campaign list'));
          console.log(chalk.gray('  查看认证状态: ') + chalk.cyan('google-ads auth status'));
          console.log();
        },

        onError: (error) => {
          spinner?.fail('登录失败');
          console.log();
          console.log(chalk.red(`❌ ${error}`));
          console.log();
        },
      });
    } catch (error) {
      handleError(error);
    }
  });
