# Optima Ads 系统架构

> 本文档面向团队开发者，介绍 Optima Ads 的整体架构设计。

## 概览

Optima Ads 是一个 Monorepo 项目，包含两个主要包：

```
optima-ads/
├── packages/
│   ├── cli/          # @optima-chat/ads-cli - 命令行工具
│   └── backend/      # @optima-chat/ads-backend - REST API 服务
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

**核心目标**：通过 CLI 工具管理 Google Ads 账号和广告投放，专为 Claude Code 和其他 AI 设计。

---

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  用户层                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│    │  Claude Code │         │    终端用户   │         │   optima-    │       │
│    │     (AI)     │         │   (开发者)    │         │    agent     │       │
│    └──────┬───────┘         └──────┬───────┘         └──────┬───────┘       │
│           │                        │                        │               │
│           └────────────────────────┼────────────────────────┘               │
│                                    ▼                                        │
│                          ┌─────────────────┐                                │
│                          │   google-ads    │                                │
│                          │      CLI        │                                │
│                          │ (Commander.js)  │                                │
│                          └────────┬────────┘                                │
│                                   │                                         │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                                    │ HTTPS (Bearer Token)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               服务层                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                       ads-backend (NestJS)                      │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │                                                                  │      │
│    │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │      │
│    │  │ AuthModule   │    │ GoogleAds    │    │ HealthModule │       │      │
│    │  │              │    │ Module       │    │              │       │      │
│    │  ├──────────────┤    ├──────────────┤    ├──────────────┤       │      │
│    │  │ AuthController│   │ Campaigns    │    │HealthController     │      │
│    │  │ JwtStrategy  │    │ AdGroups     │    │              │       │      │
│    │  │ AuthClient   │    │ Keywords     │    └──────────────┘       │      │
│    │  │ Service      │    │ Ads          │                           │      │
│    │  └──────┬───────┘    │ Query        │                           │      │
│    │         │            │ Accounts     │                           │      │
│    │         │            └──────┬───────┘                           │      │
│    │         │                   │                                   │      │
│    └─────────┼───────────────────┼───────────────────────────────────┘      │
│              │                   │                                          │
└──────────────┼───────────────────┼──────────────────────────────────────────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐   ┌──────────────────────┐
│     user-auth        │   │    Google Ads API    │
│   (Optima 认证)       │   │     (MCC 模式)        │
│                      │   │                      │
│  - Device Flow OAuth │   │  - MCC 管理账号       │
│  - JWT Token 验证     │   │  - GAQL 查询          │
│                      │   │  - 广告管理操作        │
└──────────────────────┘   └──────────────────────┘
```

---

## CLI 架构 (@optima-chat/ads-cli)

### 技术栈

- **语言**: TypeScript (ESM)
- **CLI 框架**: Commander.js
- **HTTP 客户端**: Axios
- **构建工具**: tsc

### 目录结构

```
packages/cli/src/
├── index.ts              # 入口，注册所有命令
├── config.ts             # 配置常量
├── lib/
│   ├── api-client.ts     # Backend API 客户端
│   ├── token-store.ts    # Token 存储管理
│   ├── device-flow.ts    # Device Flow 登录流程
│   └── auth-types.ts     # 认证相关类型
├── commands/
│   ├── auth/             # 认证命令
│   │   ├── login.ts      # 登录
│   │   ├── logout.ts     # 登出
│   │   └── status.ts     # 状态查看
│   ├── account/          # 账号管理
│   │   ├── link.ts       # 关联账号
│   │   └── check.ts      # 检查状态
│   ├── campaign/         # 广告系列 CRUD
│   ├── ad-group/         # 广告组 CRUD
│   ├── keyword/          # 关键词管理
│   ├── ad/               # 广告管理
│   ├── query.ts          # GAQL 查询
│   └── config.ts         # 配置管理
└── utils/
    ├── errors.ts         # 错误处理
    ├── customer-id.ts    # Customer ID 管理
    └── optima-config.ts  # Optima 配置获取
```

### 认证流程

CLI 使用 OAuth2 Device Flow 进行登录，与 optima-agent 共享 token：

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│     CLI     │                    │  user-auth  │                    │    用户     │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                  │                                  │
       │  1. POST /oauth/device/authorize │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │  2. device_code + user_code      │                                  │
       │<─────────────────────────────────│                                  │
       │                                  │                                  │
       │  3. 显示 user_code 和 URL         │                                  │
       │────────────────────────────────────────────────────────────────────>│
       │                                  │                                  │
       │                                  │  4. 用户访问 URL 登录              │
       │                                  │<─────────────────────────────────│
       │                                  │                                  │
       │  5. 轮询 POST /oauth/device/token│                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │  6. access_token + refresh_token │                                  │
       │<─────────────────────────────────│                                  │
       │                                  │                                  │
       │  7. 保存到 ~/.optima/token.json  │                                  │
       ▼                                  ▼                                  ▼
```

### Token 存储

Token 存储在 `~/.optima/token.json`，格式如下：

```json
{
  "env": "prod",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_at": 1706636400000,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 环境配置

支持三个环境，通过 `--env` 参数切换：

| 环境 | Auth URL | Ads API URL |
|------|----------|-------------|
| ci | auth.optima.chat | ads-api.optima.onl |
| stage | auth.stage.optima.onl | ads-api.stage.optima.onl |
| prod | auth.optima.onl | ads-api.optima.onl |

### Commerce Backend 集成

CLI 启动时会自动从 commerce-backend 获取商户的 Google Ads Customer ID：

```
┌─────────────┐                    ┌──────────────────┐
│     CLI     │                    │ commerce-backend │
└──────┬──────┘                    └────────┬─────────┘
       │                                    │
       │  1. GET /api/merchants/me          │
       │    Authorization: Bearer <token>   │
       │───────────────────────────────────>│
       │                                    │
       │  2. { google_ads_customer_id, name }
       │<───────────────────────────────────│
       │                                    │
       │  3. 保存到本地配置                   │
       │    ~/.config/google-ads-cli/       │
       ▼                                    ▼
```

**流程说明**：

1. CLI 启动时调用 `fetchOptimaConfig()`
2. 使用 `~/.optima/token.json` 中的 token 调用 commerce-backend
3. 获取商户的 `google_ads_customer_id` 字段
4. 缓存到本地配置 `~/.config/google-ads-cli/config.json`

**Commerce Backend 端**：

商户的 Google Ads Customer ID 存储在 `merchant_profiles` 表的 `google_ads_customer_id` 字段中。

| 环境 | Commerce API URL |
|------|------------------|
| ci | api.optima.chat |
| stage | api.stage.optima.onl |
| prod | api.optima.onl |

---

## Backend 架构 (@optima-chat/ads-backend)

### 技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **认证**: Passport.js + JWT
- **Google Ads**: google-ads-api (Node.js SDK)

### 模块结构

```
packages/backend/src/
├── main.ts               # 应用入口
├── app.module.ts         # 根模块
├── auth/                 # 认证模块
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth-client.service.ts  # 调用 user-auth 验证 token
│   ├── jwt.strategy.ts         # Passport JWT 策略
│   └── jwt-auth.guard.ts       # JWT 守卫
├── google-ads/           # Google Ads 模块
│   ├── google-ads.module.ts
│   ├── google-ads.service.ts   # 核心 Google Ads API 封装
│   ├── accounts.controller.ts  # 账号管理
│   ├── campaigns/              # 广告系列
│   ├── ad-groups/              # 广告组
│   ├── keywords/               # 关键词
│   ├── ads/                    # 广告
│   └── query/                  # GAQL 查询
├── health/               # 健康检查
│   ├── health.module.ts
│   └── health.controller.ts
└── common/               # 公共组件
    └── decorators/
        ├── public.decorator.ts
        └── user.decorator.ts
```

### API 端点

所有 API 使用 `/api/v1` 前缀，需要 JWT 认证：

#### 认证

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /auth/google-ads/status | 获取连接状态 |
| GET | /auth/google-ads/connect | 开始 OAuth2 连接 |
| DELETE | /auth/google-ads/disconnect | 断开连接 |

#### 账号

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /accounts | 列出可访问账号 |
| GET | /accounts/:customerId | 获取账号信息 |
| GET | /accounts/:customerId/check | 检查账号链接状态 |

#### 广告系列

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /customers/:id/campaigns | 列出广告系列 |
| GET | /customers/:id/campaigns/:cid | 获取广告系列详情 |
| POST | /customers/:id/campaigns | 创建广告系列 |
| PATCH | /customers/:id/campaigns/:cid | 更新广告系列 |
| DELETE | /customers/:id/campaigns/:cid | 删除广告系列 |

#### 广告组、关键词、广告

结构与广告系列类似，端点路径：
- `/customers/:id/ad-groups`
- `/customers/:id/keywords`
- `/customers/:id/ads`

#### 查询

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /customers/:id/query | 执行 GAQL 查询 |

### MCC 模式

Backend 使用 MCC（Manager Customer Center）模式访问 Google Ads API：

```
┌─────────────────────┐
│      MCC 账号        │  ← 使用 MCC 的凭据和 Developer Token
│  (Manager Account)  │
└─────────┬───────────┘
          │
          │ customer_client_link
          │
    ┌─────┴─────┬─────────────┐
    ▼           ▼             ▼
┌───────┐   ┌───────┐     ┌───────┐
│客户 A  │   │客户 B  │     │客户 C  │
└───────┘   └───────┘     └───────┘
```

**关键概念**：

- **login_customer_id**: MCC 账号 ID，用于认证
- **customer_id**: 实际操作的客户账号 ID
- **customer_client_link**: MCC 与客户账号的关联关系

### 链接状态检查

`getClientLinkStatus()` 方法通过查询 `customer_client_link` 资源获取账号链接状态：

```typescript
async getClientLinkStatus(customerId: string) {
  const query = `
    SELECT
      customer_client_link.client_customer,
      customer_client_link.status,
      customer_client_link.manager_link_id
    FROM customer_client_link
    WHERE customer_client_link.client_customer = 'customers/${customerId}'
  `;
  // 从 MCC 视角查询
  const results = await this.query(this.loginCustomerId, query);
  // 状态码映射: 2=active, 4=pending, 5=refused, 6=canceled
}
```

返回状态：
- `active`: 账号已连接，可以访问
- `pending`: 邀请已发送，等待客户接受
- `refused`: 客户已拒绝邀请
- `canceled`: 邀请已取消
- `not_linked`: 该账号未关联到 MCC

---

## 数据流

### 列出广告系列

```
┌─────────┐   ┌─────────────┐   ┌─────────────┐   ┌────────────┐
│   CLI   │──>│ api-client  │──>│  ads-backend │──>│ Google Ads │
│         │   │ (axios)     │   │  (NestJS)   │   │    API     │
└─────────┘   └─────────────┘   └─────────────┘   └────────────┘
     │                                                   │
     │  google-ads campaign list                         │
     │                                                   │
     │  1. getToken() from ~/.optima/token.json          │
     │  2. GET /api/v1/customers/:id/campaigns           │
     │     Authorization: Bearer <token>                 │
     │                                                   │
     │  3. JwtAuthGuard 验证 token                        │
     │  4. GoogleAdsService.listCampaigns()              │
     │  5. GAQL: SELECT campaign.id, ... FROM campaign   │
     │                                                   │
     │  6. JSON 响应                                      │
     │<──────────────────────────────────────────────────│
     │                                                   │
     │  7. console.log(JSON.stringify(result))           │
     ▼                                                   ▼
```

---

## 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动 Backend
pnpm --filter @optima-chat/ads-backend dev

# 使用 CLI（指向本地 Backend）
ADS_BACKEND_URL=http://localhost:8000 pnpm --filter @optima-chat/ads-cli dev

# 或者使用 tsx 直接运行
cd packages/cli
ADS_BACKEND_URL=http://localhost:8000 tsx src/index.ts campaign list
```

### 添加新命令

1. 在 `packages/cli/src/commands/<module>/` 下创建命令文件
2. 在 `packages/cli/src/commands/<module>/index.ts` 注册命令
3. 在 `packages/cli/src/lib/api-client.ts` 添加 API 方法

### 添加新 API 端点

1. 在 `packages/backend/src/google-ads/<module>/` 下添加 Controller 和 Service
2. 在 Module 中注册
3. 如需要，在 GoogleAdsService 中添加底层方法

### 输出规范

**所有 CLI 命令默认输出 JSON**，便于 AI 解析：

```typescript
// 正确
console.log(JSON.stringify(result, null, 2));

// 错误 - 不要使用 spinner 或 chalk
// const spinner = ora('Loading...').start();
// console.log(chalk.green('Success!'));
```

---

## 部署

### CI/CD

- 推送标签触发自动发布
- Backend 部署到 AWS ECS Fargate

```bash
# 发布新版本
git tag v0.9.0
git push origin v0.9.0
```

### 环境变量

Backend 需要配置：

```bash
# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_MANAGER_ACCOUNT_ID=xxx  # MCC ID
GOOGLE_ADS_REFRESH_TOKEN=xxx

# Auth
USER_AUTH_URL=https://auth.optima.onl

# Server
PORT=8000
CORS_ORIGIN=*
```

---

## 相关文档

- [GAQL CLI 参考](./gaql-cli-reference.md)
- [命令示例](./EXAMPLES.md)
- [客户创建账号指南](./customer-account-guide.md)
- [MCC 关联流程说明](./mcc-linking-guide.md)
- [配置存储说明](./config-storage.md)
