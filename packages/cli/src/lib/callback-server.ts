/**
 * OAuth2 Callback Server - 本地服务器接收 OAuth 回调
 */

import express, { Express, Request, Response } from 'express';
import { Server } from 'http';

export class CallbackServer {
  private app: Express;
  private server: Server | null = null;
  private port: number;
  private codeResolver: ((code: string) => void) | null = null;
  private errorResolver: ((error: Error) => void) | null = null;

  constructor(port: number = 9001) {
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }

  /**
   * 设置路由
   */
  private setupRoutes() {
    // OAuth 回调路由
    this.app.get('/callback', (req: Request, res: Response) => {
      const { code, error } = req.query;

      if (error) {
        res.send(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #e74c3c;">❌ 授权失败</h1>
              <p>错误: ${error}</p>
              <p style="color: #7f8c8d;">您可以关闭此窗口</p>
            </body>
          </html>
        `);

        if (this.errorResolver) {
          this.errorResolver(new Error(`OAuth 授权失败: ${error}`));
        }
        return;
      }

      if (!code || typeof code !== 'string') {
        res.send(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #e74c3c;">❌ 授权失败</h1>
              <p>未收到授权码</p>
              <p style="color: #7f8c8d;">您可以关闭此窗口</p>
            </body>
          </html>
        `);

        if (this.errorResolver) {
          this.errorResolver(new Error('未收到授权码'));
        }
        return;
      }

      // 成功
      res.send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #27ae60;">✅ 授权成功！</h1>
            <p>您可以关闭此窗口，返回终端继续操作</p>
            <script>
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `);

      if (this.codeResolver) {
        this.codeResolver(code);
      }
    });

    // 健康检查
    this.app.get('/health', (req: Request, res: Response) => {
      res.send('OK');
    });
  }

  /**
   * 启动服务器
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`端口 ${this.port} 已被占用，请使用 --port 指定其他端口`));
          } else {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 等待 OAuth 回调
   */
  waitForCallback(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.codeResolver = resolve;
      this.errorResolver = reject;

      // 设置超时（5 分钟）
      setTimeout(() => {
        reject(new Error('等待授权超时（5 分钟），请重试'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * 关闭服务器
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取端口号
   */
  getPort(): number {
    return this.port;
  }
}
